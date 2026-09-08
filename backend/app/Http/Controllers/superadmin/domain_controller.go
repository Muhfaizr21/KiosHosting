package superadmin

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"

	"github.com/gin-gonic/gin"
)

func generateEPPCode() string {
	b := make([]byte, 6)
	rand.Read(b)
	return fmt.Sprintf("EPP-%s#%d!", strings.ToUpper(hex.EncodeToString(b)[:8]), time.Now().Year()%100)
}

// ListRegisteredDomains returns domains with overview statistics
func ListRegisteredDomains(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "15"))
	registrar := c.DefaultQuery("registrar", "all")
	status := c.DefaultQuery("status", "all")
	search := c.DefaultQuery("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 15
	}
	offset := (page - 1) * limit

	// Overview KPIs
	var totalDomains, pandiCount, gtldCount, expiringSoonCount int64
	bootstrap.DB.Model(&models.RegisteredDomain{}).Count(&totalDomains)
	bootstrap.DB.Model(&models.RegisteredDomain{}).Where("registrar = ?", models.RegistrarPANDI).Count(&pandiCount)
	bootstrap.DB.Model(&models.RegisteredDomain{}).Where("registrar IN (?, ?)", models.RegistrarResellerClub, models.RegistrarNamecheap).Count(&gtldCount)
	now := time.Now()
	bootstrap.DB.Model(&models.RegisteredDomain{}).Where("expires_at <= ? AND status = 'Active'", now.AddDate(0, 0, 30)).Count(&expiringSoonCount)

	query := bootstrap.DB.Model(&models.RegisteredDomain{}).Preload("User")

	if registrar != "all" && registrar != "" {
		query = query.Where("registrar = ?", registrar)
	}
	if status != "all" && status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		pattern := "%" + strings.ToLower(search) + "%"
		query = query.Joins("LEFT JOIN users ON users.id = registered_domains.user_id").
			Where("LOWER(registered_domains.domain_name) LIKE ? OR LOWER(users.name) LIKE ?", pattern, pattern)
	}

	var total int64
	query.Count(&total)

	var domains []models.RegisteredDomain
	query.Order("registered_domains.expires_at asc").Offset(offset).Limit(limit).Find(&domains)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_domains":  totalDomains,
			"pandi_id":       pandiCount,
			"gtld_domains":   gtldCount,
			"expiring_soon":  expiringSoonCount,
		},
		"data":        domains,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

// RegisterDomain creates a newly managed domain and populates default zone records
func RegisterDomain(c *gin.Context) {
	var input struct {
		UserID       uint                 `json:"user_id" binding:"required"`
		DomainName   string               `json:"domain_name" binding:"required"`
		Registrar    models.RegistrarType `json:"registrar"`
		Years        int                  `json:"years"`
		WhoisPrivacy *bool                `json:"whois_privacy"`
		AutoRenew    *bool                `json:"auto_renew"`
		NS1          string               `json:"ns1"`
		NS2          string               `json:"ns2"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid", "error": err.Error()})
		return
	}

	var user models.User
	if err := bootstrap.DB.First(&user, input.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Client tidak ditemukan"})
		return
	}

	domainClean := strings.ToLower(strings.TrimSpace(input.DomainName))

	// Check if already registered
	var existing models.RegisteredDomain
	if err := bootstrap.DB.Where("domain_name = ?", domainClean).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Domain ini sudah terdaftar dalam sistem"})
		return
	}

	registrar := input.Registrar
	if registrar == "" {
		if strings.HasSuffix(domainClean, ".id") || strings.HasSuffix(domainClean, ".co.id") || strings.HasSuffix(domainClean, ".my.id") {
			registrar = models.RegistrarPANDI
		} else {
			registrar = models.RegistrarResellerClub
		}
	}

	years := input.Years
	if years < 1 {
		years = 1
	}

	whois := true
	if input.WhoisPrivacy != nil {
		whois = *input.WhoisPrivacy
	}
	autoRenew := true
	if input.AutoRenew != nil {
		autoRenew = *input.AutoRenew
	}

	ns1 := input.NS1
	if ns1 == "" {
		ns1 = "ns1.kioshosting.id"
	}
	ns2 := input.NS2
	if ns2 == "" {
		ns2 = "ns2.kioshosting.id"
	}

	now := time.Now()
	domain := models.RegisteredDomain{
		UserID:       user.ID,
		DomainName:   domainClean,
		Registrar:    registrar,
		EPPCode:      generateEPPCode(),
		IsLocked:     true,
		WhoisPrivacy: whois,
		AutoRenew:    autoRenew,
		Status:       models.DomainStatusActive,
		RegisteredAt: now,
		ExpiresAt:    now.AddDate(years, 0, 0),
		NS1:          ns1,
		NS2:          ns2,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := bootstrap.DB.Create(&domain).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mendaftarkan domain", "error": err.Error()})
		return
	}

	// Query Primary Server Connector for Dynamic IP
	var defaultServer models.ServerConnector
	serverIP := "103.189.234.10"
	if err := bootstrap.DB.Where("status = ?", models.ServerStatusConnected).First(&defaultServer).Error; err == nil && defaultServer.IP != "" {
		serverIP = defaultServer.IP
	} else if err := bootstrap.DB.First(&defaultServer).Error; err == nil && defaultServer.IP != "" {
		serverIP = defaultServer.IP
	}

	// Seed Standard Default DNS Zone
	defaultRecords := []models.DNSRecord{
		{RegisteredDomainID: domain.ID, Type: "A", Name: "@", Content: serverIP, TTL: 3600},
		{RegisteredDomainID: domain.ID, Type: "CNAME", Name: "www", Content: domainClean + ".", TTL: 3600},
		{RegisteredDomainID: domain.ID, Type: "A", Name: "mail", Content: serverIP, TTL: 3600},
		{RegisteredDomainID: domain.ID, Type: "MX", Name: "@", Content: "mail." + domainClean + ".", TTL: 3600, Priority: 10},
		{RegisteredDomainID: domain.ID, Type: "TXT", Name: "@", Content: fmt.Sprintf("v=spf1 a mx ip4:%s ~all", serverIP), TTL: 3600},
	}
	for _, rec := range defaultRecords {
		bootstrap.DB.Create(&rec)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Domain berhasil didaftarkan dan zona DNS default telah dibuat",
		"data":    domain,
	})
}

// ToggleDomainSecurity updates lock, privacy, or auto-renew
func ToggleDomainSecurity(c *gin.Context) {
	id := c.Param("id")
	var domain models.RegisteredDomain
	if err := bootstrap.DB.First(&domain, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Domain tidak ditemukan"})
		return
	}

	var input struct {
		Field string `json:"field" binding:"required"` // lock, privacy, renew
		Value bool   `json:"value"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Field required (lock, privacy, renew)"})
		return
	}

	switch input.Field {
	case "lock":
		domain.IsLocked = input.Value
	case "privacy":
		domain.WhoisPrivacy = input.Value
	case "renew":
		domain.AutoRenew = input.Value
	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": "Field tidak valid"})
		return
	}

	domain.UpdatedAt = time.Now()
	bootstrap.DB.Save(&domain)

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Fitur %s berhasil diubah", input.Field),
		"data":    domain,
	})
}

// GetDomainEPP returns or regenerates the auth/EPP transfer key
func GetDomainEPP(c *gin.Context) {
	id := c.Param("id")
	var domain models.RegisteredDomain
	if err := bootstrap.DB.First(&domain, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Domain tidak ditemukan"})
		return
	}

	regenerate := c.Query("regenerate") == "true"
	if regenerate || domain.EPPCode == "" {
		domain.EPPCode = generateEPPCode()
		domain.UpdatedAt = time.Now()
		bootstrap.DB.Save(&domain)
	}

	c.JSON(http.StatusOK, gin.H{
		"domain":    domain.DomainName,
		"epp_code":  domain.EPPCode,
		"is_locked": domain.IsLocked,
	})
}

// UpdateNameservers updates nameserver hostnames
func UpdateNameservers(c *gin.Context) {
	id := c.Param("id")
	var domain models.RegisteredDomain
	if err := bootstrap.DB.First(&domain, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Domain tidak ditemukan"})
		return
	}

	var input struct {
		NS1 string `json:"ns1" binding:"required"`
		NS2 string `json:"ns2" binding:"required"`
		NS3 string `json:"ns3"`
		NS4 string `json:"ns4"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "NS1 dan NS2 wajib diisi"})
		return
	}

	domain.NS1 = input.NS1
	domain.NS2 = input.NS2
	domain.NS3 = input.NS3
	domain.NS4 = input.NS4
	domain.UpdatedAt = time.Now()
	bootstrap.DB.Save(&domain)

	c.JSON(http.StatusOK, gin.H{"message": "Nameserver berhasil diperbarui ke registrar", "data": domain})
}

// ListDNSRecords returns all zone records for a domain
func ListDNSRecords(c *gin.Context) {
	id := c.Param("id")
	var domain models.RegisteredDomain
	if err := bootstrap.DB.First(&domain, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Domain tidak ditemukan"})
		return
	}

	var records []models.DNSRecord
	bootstrap.DB.Where("registered_domain_id = ?", domain.ID).Order("type asc, name asc").Find(&records)

	c.JSON(http.StatusOK, gin.H{
		"domain":  domain,
		"records": records,
	})
}

// CreateDNSRecord adds a new zone record
func CreateDNSRecord(c *gin.Context) {
	id := c.Param("id")
	var domain models.RegisteredDomain
	if err := bootstrap.DB.First(&domain, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Domain tidak ditemukan"})
		return
	}

	var input struct {
		Type     string `json:"type" binding:"required"`
		Name     string `json:"name" binding:"required"`
		Content  string `json:"content" binding:"required"`
		TTL      int    `json:"ttl"`
		Priority int    `json:"priority"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid", "error": err.Error()})
		return
	}

	ttl := input.TTL
	if ttl <= 0 {
		ttl = 3600
	}

	recType := strings.ToUpper(strings.TrimSpace(input.Type))
	record := models.DNSRecord{
		RegisteredDomainID: domain.ID,
		Type:               recType,
		Name:               strings.TrimSpace(input.Name),
		Content:            strings.TrimSpace(input.Content),
		TTL:                ttl,
		Priority:           input.Priority,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if err := bootstrap.DB.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan DNS record"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "DNS record berhasil ditambahkan", "data": record})
}

// UpdateDNSRecord modifies an existing zone entry
func UpdateDNSRecord(c *gin.Context) {
	recordID := c.Param("record_id")
	var record models.DNSRecord
	if err := bootstrap.DB.First(&record, recordID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "DNS record tidak ditemukan"})
		return
	}

	var input struct {
		Type     string `json:"type"`
		Name     string `json:"name"`
		Content  string `json:"content"`
		TTL      int    `json:"ttl"`
		Priority int    `json:"priority"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid"})
		return
	}

	if input.Type != "" {
		record.Type = strings.ToUpper(input.Type)
	}
	if input.Name != "" {
		record.Name = input.Name
	}
	if input.Content != "" {
		record.Content = input.Content
	}
	if input.TTL > 0 {
		record.TTL = input.TTL
	}
	record.Priority = input.Priority
	record.UpdatedAt = time.Now()

	bootstrap.DB.Save(&record)
	c.JSON(http.StatusOK, gin.H{"message": "DNS record berhasil diperbarui", "data": record})
}

// DeleteDNSRecord removes a record from the zone
func DeleteDNSRecord(c *gin.Context) {
	recordID := c.Param("record_id")
	if err := bootstrap.DB.Delete(&models.DNSRecord{}, recordID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus DNS record"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "DNS record berhasil dihapus"})
}

// ApplyDNSPreset applies quick 1-click enterprise templates
func ApplyDNSPreset(c *gin.Context) {
	id := c.Param("id")
	var domain models.RegisteredDomain
	if err := bootstrap.DB.First(&domain, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Domain tidak ditemukan"})
		return
	}

	var input struct {
		Preset string `json:"preset" binding:"required"` // google_workspace, microsoft_365, cloudflare, default
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Preset diperlukan (google_workspace, microsoft_365, cloudflare, default)"})
		return
	}

	now := time.Now()
	var newRecords []models.DNSRecord

	switch strings.ToLower(input.Preset) {
	case "google_workspace":
		// Remove existing MX and SPF TXT records
		bootstrap.DB.Where("registered_domain_id = ? AND (type = 'MX' OR (type = 'TXT' AND content LIKE 'v=spf1%'))", domain.ID).Delete(&models.DNSRecord{})
		newRecords = []models.DNSRecord{
			{RegisteredDomainID: domain.ID, Type: "MX", Name: "@", Content: "aspmx.l.google.com.", TTL: 3600, Priority: 1, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "MX", Name: "@", Content: "alt1.aspmx.l.google.com.", TTL: 3600, Priority: 5, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "MX", Name: "@", Content: "alt2.aspmx.l.google.com.", TTL: 3600, Priority: 5, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "MX", Name: "@", Content: "alt3.aspmx.l.google.com.", TTL: 3600, Priority: 10, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "MX", Name: "@", Content: "alt4.aspmx.l.google.com.", TTL: 3600, Priority: 10, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "TXT", Name: "@", Content: "v=spf1 include:_spf.google.com ~all", TTL: 3600, CreatedAt: now, UpdatedAt: now},
		}

	case "microsoft_365":
		bootstrap.DB.Where("registered_domain_id = ? AND (type = 'MX' OR (type = 'TXT' AND content LIKE 'v=spf1%'))", domain.ID).Delete(&models.DNSRecord{})
		cleanDomTag := strings.ReplaceAll(domain.DomainName, ".", "-")
		newRecords = []models.DNSRecord{
			{RegisteredDomainID: domain.ID, Type: "MX", Name: "@", Content: cleanDomTag + ".mail.protection.outlook.com.", TTL: 3600, Priority: 0, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "CNAME", Name: "autodiscover", Content: "autodiscover.outlook.com.", TTL: 3600, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "TXT", Name: "@", Content: "v=spf1 include:spf.protection.outlook.com -all", TTL: 3600, CreatedAt: now, UpdatedAt: now},
		}

	case "cloudflare":
		newRecords = []models.DNSRecord{
			{RegisteredDomainID: domain.ID, Type: "NS", Name: "@", Content: "dave.ns.cloudflare.com.", TTL: 86400, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "NS", Name: "@", Content: "lola.ns.cloudflare.com.", TTL: 86400, CreatedAt: now, UpdatedAt: now},
		}

	case "default":
		var defaultServer models.ServerConnector
		serverIP := "103.189.234.10"
		if err := bootstrap.DB.Where("status = ?", models.ServerStatusConnected).First(&defaultServer).Error; err == nil && defaultServer.IP != "" {
			serverIP = defaultServer.IP
		} else if err := bootstrap.DB.First(&defaultServer).Error; err == nil && defaultServer.IP != "" {
			serverIP = defaultServer.IP
		}

		bootstrap.DB.Where("registered_domain_id = ?", domain.ID).Delete(&models.DNSRecord{})
		newRecords = []models.DNSRecord{
			{RegisteredDomainID: domain.ID, Type: "A", Name: "@", Content: serverIP, TTL: 3600, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "CNAME", Name: "www", Content: domain.DomainName + ".", TTL: 3600, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "A", Name: "mail", Content: serverIP, TTL: 3600, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "MX", Name: "@", Content: "mail." + domain.DomainName + ".", TTL: 3600, Priority: 10, CreatedAt: now, UpdatedAt: now},
			{RegisteredDomainID: domain.ID, Type: "TXT", Name: "@", Content: fmt.Sprintf("v=spf1 a mx ip4:%s ~all", serverIP), TTL: 3600, CreatedAt: now, UpdatedAt: now},
		}

	default:
		c.JSON(http.StatusBadRequest, gin.H{"message": "Preset tidak dikenal"})
		return
	}

	for _, r := range newRecords {
		bootstrap.DB.Create(&r)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Preset DNS %s berhasil diterapkan", input.Preset),
		"count":   len(newRecords),
	})
}
