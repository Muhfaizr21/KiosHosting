package superadmin

import (
	"net/http"
	"strconv"
	"strings"

	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"

	"github.com/gin-gonic/gin"
)

// SeedInitialProducts adds standard default plans and TLDs if tables are empty
func seedDefaultProductsIfEmpty() {
	var planCount int64
	bootstrap.DB.Model(&models.HostingPlan{}).Count(&planCount)
	if planCount == 0 {
		initialPlans := []models.HostingPlan{
			{
				Name:          "Starter Pro",
				Price:         15000,
				BillingCycle:  "monthly",
				Disk:          "5 GB NVMe",
				CPU:           "1 Core",
				RAM:           "1 GB",
				Bandwidth:     "Unlimited",
				ActiveClients: 124,
				Status:        "Active",
			},
			{
				Name:          "Business Pro",
				Price:         45000,
				BillingCycle:  "monthly",
				Disk:          "20 GB NVMe",
				CPU:           "2 Core",
				RAM:           "2 GB",
				Bandwidth:     "Unlimited",
				ActiveClients: 56,
				Status:        "Active",
			},
			{
				Name:          "Enterprise Cloud",
				Price:         120000,
				BillingCycle:  "monthly",
				Disk:          "Unlimited NVMe",
				CPU:           "4 Core",
				RAM:           "8 GB",
				Bandwidth:     "Unlimited",
				ActiveClients: 12,
				Status:        "Active",
			},
		}
		for _, p := range initialPlans {
			bootstrap.DB.Create(&p)
		}
	}

	var domainCount int64
	bootstrap.DB.Model(&models.DomainTLD{}).Count(&domainCount)
	if domainCount == 0 {
		initialTLDs := []models.DomainTLD{
			{TLD: ".com", RegisterPrice: 165000, RenewPrice: 175000, TransferPrice: 165000, IsActive: true},
			{TLD: ".id", RegisterPrice: 250000, RenewPrice: 275000, TransferPrice: 250000, IsActive: true},
			{TLD: ".net", RegisterPrice: 180000, RenewPrice: 190000, TransferPrice: 180000, IsActive: true},
			{TLD: ".co.id", RegisterPrice: 300000, RenewPrice: 320000, TransferPrice: 300000, IsActive: true},
			{TLD: ".xyz", RegisterPrice: 35000, RenewPrice: 185000, TransferPrice: 185000, IsActive: true},
		}
		for _, d := range initialTLDs {
			bootstrap.DB.Create(&d)
		}
	}
}

// ==================== HOSTING PLANS ====================

func ListHostingPlans(c *gin.Context) {
	seedDefaultProductsIfEmpty()

	var plans []models.HostingPlan
	if err := bootstrap.DB.Order("price asc").Find(&plans).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil daftar paket hosting"})
		return
	}
	c.JSON(http.StatusOK, plans)
}

type hostingPlanInput struct {
	Name         string  `json:"name"`
	Price        float64 `json:"price"`
	BillingCycle string  `json:"cycle"`
	Disk         string  `json:"disk"`
	CPU          string  `json:"cpu"`
	RAM          string  `json:"ram"`
	Bandwidth    string  `json:"bandwidth"`
	Status       string  `json:"status"`
}

func CreateHostingPlan(c *gin.Context) {
	var input hostingPlanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	name := strings.TrimSpace(input.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Nama paket hosting wajib diisi"})
		return
	}
	if input.Price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Harga paket harus lebih dari 0"})
		return
	}

	cycle := input.BillingCycle
	if cycle == "" {
		cycle = "monthly"
	}
	disk := input.Disk
	if disk == "" {
		disk = "10 GB NVMe"
	}
	status := input.Status
	if status == "" {
		status = "Active"
	}

	plan := models.HostingPlan{
		Name:         name,
		Price:        input.Price,
		BillingCycle: cycle,
		Disk:         disk,
		CPU:          input.CPU,
		RAM:          input.RAM,
		Bandwidth:    input.Bandwidth,
		Status:       status,
	}

	if err := bootstrap.DB.Create(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menambahkan paket hosting"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Paket hosting berhasil ditambahkan",
		"data":    plan,
	})
}

func UpdateHostingPlan(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID paket tidak valid"})
		return
	}

	var plan models.HostingPlan
	if err := bootstrap.DB.First(&plan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Paket hosting tidak ditemukan"})
		return
	}

	var input hostingPlanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	if strings.TrimSpace(input.Name) != "" {
		plan.Name = strings.TrimSpace(input.Name)
	}
	if input.Price > 0 {
		plan.Price = input.Price
	}
	if input.BillingCycle != "" {
		plan.BillingCycle = input.BillingCycle
	}
	if input.Disk != "" {
		plan.Disk = input.Disk
	}
	if input.CPU != "" {
		plan.CPU = input.CPU
	}
	if input.RAM != "" {
		plan.RAM = input.RAM
	}
	if input.Bandwidth != "" {
		plan.Bandwidth = input.Bandwidth
	}
	if input.Status != "" {
		plan.Status = input.Status
	}

	if err := bootstrap.DB.Save(&plan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui paket hosting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Paket hosting berhasil diperbarui",
		"data":    plan,
	})
}

func DeleteHostingPlan(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID paket tidak valid"})
		return
	}

	if err := bootstrap.DB.Delete(&models.HostingPlan{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus paket hosting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Paket hosting berhasil dihapus"})
}

// ==================== DOMAIN TLDS ====================

func ListDomainTLDs(c *gin.Context) {
	seedDefaultProductsIfEmpty()

	var tlds []models.DomainTLD
	if err := bootstrap.DB.Order("id asc").Find(&tlds).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil daftar TLD"})
		return
	}
	c.JSON(http.StatusOK, tlds)
}

type domainTLDInput struct {
	TLD           string  `json:"tld"`
	RegisterPrice float64 `json:"register"`
	RenewPrice    float64 `json:"renew"`
	TransferPrice float64 `json:"transfer"`
	IsActive      *bool   `json:"active"`
}

func CreateDomainTLD(c *gin.Context) {
	var input domainTLDInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	tld := strings.TrimSpace(input.TLD)
	if tld == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Ekstensi domain (TLD) wajib diisi"})
		return
	}
	if !strings.HasPrefix(tld, ".") {
		tld = "." + tld
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	d := models.DomainTLD{
		TLD:           tld,
		RegisterPrice: input.RegisterPrice,
		RenewPrice:    input.RenewPrice,
		TransferPrice: input.TransferPrice,
		IsActive:      isActive,
	}

	if err := bootstrap.DB.Create(&d).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Gagal menambahkan TLD (mungkin sudah terdaftar)"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "TLD domain berhasil ditambahkan",
		"data":    d,
	})
}

func UpdateDomainTLD(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID TLD tidak valid"})
		return
	}

	var d models.DomainTLD
	if err := bootstrap.DB.First(&d, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "TLD domain tidak ditemukan"})
		return
	}

	var input domainTLDInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	if strings.TrimSpace(input.TLD) != "" {
		tld := strings.TrimSpace(input.TLD)
		if !strings.HasPrefix(tld, ".") {
			tld = "." + tld
		}
		d.TLD = tld
	}
	if input.RegisterPrice > 0 {
		d.RegisterPrice = input.RegisterPrice
	}
	if input.RenewPrice > 0 {
		d.RenewPrice = input.RenewPrice
	}
	if input.TransferPrice > 0 {
		d.TransferPrice = input.TransferPrice
	}
	if input.IsActive != nil {
		d.IsActive = *input.IsActive
	}

	if err := bootstrap.DB.Save(&d).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui TLD domain"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "TLD domain berhasil diperbarui",
		"data":    d,
	})
}

func ToggleDomainTLD(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID TLD tidak valid"})
		return
	}

	var d models.DomainTLD
	if err := bootstrap.DB.First(&d, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "TLD domain tidak ditemukan"})
		return
	}

	d.IsActive = !d.IsActive
	if err := bootstrap.DB.Model(&d).Update("is_active", d.IsActive).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengubah status aktif TLD"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Status aktif TLD berhasil diubah",
		"active":  d.IsActive,
	})
}

func DeleteDomainTLD(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID TLD tidak valid"})
		return
	}

	if err := bootstrap.DB.Delete(&models.DomainTLD{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus TLD domain"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "TLD domain berhasil dihapus"})
}
