package superadmin

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"

	"github.com/gin-gonic/gin"
)

// seedInitialSecurityData populates initial threats and settings if empty
func seedInitialSecurityData() {
	var count int64
	bootstrap.DB.Model(&models.BlockedIP{}).Count(&count)
	if count == 0 {
		now := time.Now()
		initialBlocks := []models.BlockedIP{
			{
				IP:        "192.168.1.45",
				Reason:    "SSH Brute Force",
				Source:    "Fail2ban",
				Node:      "JKT-01",
				Status:    "Active",
				CreatedAt: now.Add(-10 * time.Minute),
				UpdatedAt: now.Add(-10 * time.Minute),
			},
			{
				IP:        "45.33.12.99",
				Reason:    "Multiple Failed Logins",
				Source:    "Fail2ban",
				Node:      "JKT-02",
				Status:    "Active",
				CreatedAt: now.Add(-1 * time.Hour),
				UpdatedAt: now.Add(-1 * time.Hour),
			},
			{
				IP:        "203.0.113.5",
				Reason:    "SQL Injection Attempt",
				Source:    "ModSecurity",
				Node:      "JKT-01",
				Status:    "Active",
				CreatedAt: now.Add(-2 * time.Hour),
				UpdatedAt: now.Add(-2 * time.Hour),
			},
			{
				IP:        "198.51.100.22",
				Reason:    "DDoS Layer 7 HTTP Flood",
				Source:    "Cloudflare",
				Node:      "Global",
				Status:    "Active",
				CreatedAt: now.Add(-5 * time.Hour),
				UpdatedAt: now.Add(-5 * time.Hour),
			},
			{
				IP:        "185.220.101.5",
				Reason:    "Port Scanning & Probe",
				Source:    "ModSecurity",
				Node:      "SGP-01",
				Status:    "Active",
				CreatedAt: now.Add(-8 * time.Hour),
				UpdatedAt: now.Add(-8 * time.Hour),
			},
		}

		for _, b := range initialBlocks {
			bootstrap.DB.Create(&b)
		}
	}

	// Ensure default security settings
	var underAttack models.SecuritySetting
	if err := bootstrap.DB.Where("key = ?", "under_attack_mode").First(&underAttack).Error; err != nil {
		bootstrap.DB.Create(&models.SecuritySetting{Key: "under_attack_mode", Value: "false"})
	}

	var cfStatus models.SecuritySetting
	if err := bootstrap.DB.Where("key = ?", "cf_status").First(&cfStatus).Error; err != nil {
		bootstrap.DB.Create(&models.SecuritySetting{Key: "cf_status", Value: "Synced"})
	}

	var wafMode models.SecuritySetting
	if err := bootstrap.DB.Where("key = ?", "waf_mode").First(&wafMode).Error; err != nil {
		bootstrap.DB.Create(&models.SecuritySetting{Key: "waf_mode", Value: "High"})
	}
}

// GetSecurityOverview returns statistics and current WAF status
func GetSecurityOverview(c *gin.Context) {
	var totalBlocked int64
	bootstrap.DB.Model(&models.BlockedIP{}).Where("status = ?", "Active").Count(&totalBlocked)

	var activeThreats int64
	twentyFourHoursAgo := time.Now().Add(-24 * time.Hour)
	bootstrap.DB.Model(&models.BlockedIP{}).
		Where("status = ? AND created_at >= ?", "Active", twentyFourHoursAgo).
		Count(&activeThreats)

	var underAttack models.SecuritySetting
	bootstrap.DB.Where("key = ?", "under_attack_mode").First(&underAttack)
	isUnderAttack := underAttack.Value == "true"

	var cfStatus models.SecuritySetting
	bootstrap.DB.Where("key = ?", "cf_status").First(&cfStatus)
	cfStatusVal := "Synced"
	if cfStatus.Value != "" {
		cfStatusVal = cfStatus.Value
	}

	var cfCache models.SecuritySetting
	bootstrap.DB.Where("key = ?", "cf_cache_cleared_at").First(&cfCache)

	var wafMode models.SecuritySetting
	bootstrap.DB.Where("key = ?", "waf_mode").First(&wafMode)
	wafModeVal := "High"
	if wafMode.Value != "" {
		wafModeVal = wafMode.Value
	}

	systemStatus := "Protected"
	if isUnderAttack {
		systemStatus = "Under Attack Mode Active"
	}

	c.JSON(http.StatusOK, gin.H{
		"system_status":       systemStatus,
		"total_blocked":       totalBlocked,
		"active_threats":      activeThreats,
		"under_attack_mode":   isUnderAttack,
		"cf_status":           cfStatusVal,
		"cf_cache_cleared_at": cfCache.Value,
		"waf_mode":            wafModeVal,
	})
}

// ListBlockedIPs returns a paginated list of blocked IPs with optional search and filters
func ListBlockedIPs(c *gin.Context) {
	search := strings.TrimSpace(c.Query("search"))
	source := strings.TrimSpace(c.Query("source"))
	status := strings.TrimSpace(c.Query("status"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := bootstrap.DB.Model(&models.BlockedIP{})

	if status != "" && status != "All" {
		query = query.Where("status = ?", status)
	} else if status == "" {
		// default show Active
		query = query.Where("status = ?", "Active")
	}

	if source != "" && source != "All" {
		query = query.Where("source = ?", source)
	}

	if search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(ip) LIKE ? OR LOWER(reason) LIKE ? OR LOWER(node) LIKE ?", searchTerm, searchTerm, searchTerm)
	}

	var total int64
	query.Count(&total)

	var blocks []models.BlockedIP
	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&blocks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil data IP yang diblokir"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  blocks,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

type banIPInput struct {
	IP     string `json:"ip" binding:"required"`
	Reason string `json:"reason" binding:"required"`
	Source string `json:"source"`
	Node   string `json:"node"`
}

// BanIP manually bans an IP address
func BanIP(c *gin.Context) {
	var input banIPInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Alamat IP dan alasan blokir wajib diisi"})
		return
	}

	ip := strings.TrimSpace(input.IP)
	reason := strings.TrimSpace(input.Reason)
	source := strings.TrimSpace(input.Source)
	if source == "" {
		source = "Manual Admin"
	}
	node := strings.TrimSpace(input.Node)
	if node == "" {
		node = "Global"
	}

	// Check if already actively blocked
	var existing models.BlockedIP
	if err := bootstrap.DB.Where("ip = ? AND status = ?", ip, "Active").First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Alamat IP ini sudah aktif diblokir dalam sistem"})
		return
	}

	newBlock := models.BlockedIP{
		IP:     ip,
		Reason: reason,
		Source: source,
		Node:   node,
		Status: "Active",
	}

	if err := bootstrap.DB.Create(&newBlock).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan blokir IP"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "IP " + ip + " berhasil diblokir!",
		"data":    newBlock,
	})
}

// UnbanIP unbans an IP by ID
func UnbanIP(c *gin.Context) {
	id := c.Param("id")
	var block models.BlockedIP
	if err := bootstrap.DB.First(&block, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Data blokir IP tidak ditemukan"})
		return
	}

	block.Status = "Unbanned"
	if err := bootstrap.DB.Save(&block).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal membuka blokir IP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Blokir untuk IP " + block.IP + " berhasil dicabut.",
		"data":    block,
	})
}

// ClearCloudflareCache simulates purging Cloudflare edge cache
func ClearCloudflareCache(c *gin.Context) {
	nowStr := time.Now().Format("02 Jan 2006, 15:04 WIB")

	var setting models.SecuritySetting
	if err := bootstrap.DB.Where("key = ?", "cf_cache_cleared_at").First(&setting).Error; err != nil {
		bootstrap.DB.Create(&models.SecuritySetting{Key: "cf_cache_cleared_at", Value: nowStr})
	} else {
		setting.Value = nowStr
		bootstrap.DB.Save(&setting)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Seluruh cache Cloudflare Edge berhasil dibersihkan (Purge Everything)!",
		"cleared_at": nowStr,
	})
}

// ToggleUnderAttackMode switches Cloudflare Under Attack Mode
func ToggleUnderAttackMode(c *gin.Context) {
	var setting models.SecuritySetting
	if err := bootstrap.DB.Where("key = ?", "under_attack_mode").First(&setting).Error; err != nil {
		setting = models.SecuritySetting{Key: "under_attack_mode", Value: "true"}
		bootstrap.DB.Create(&setting)
	} else {
		if setting.Value == "true" {
			setting.Value = "false"
		} else {
			setting.Value = "true"
		}
		bootstrap.DB.Save(&setting)
	}

	isActive := setting.Value == "true"
	msg := "Cloudflare Under Attack Mode berhasil DINONAKTIFKAN."
	if isActive {
		msg = "Cloudflare Under Attack Mode berhasil DIAKTIFKAN. Seluruh request akan melewati JS Challenge."
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           msg,
		"under_attack_mode": isActive,
	})
}
