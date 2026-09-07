package superadmin

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func seedDefaultSettingsIfEmpty() {
	// 1. System Config
	var configCount int64
	bootstrap.DB.Model(&models.SystemConfig{}).Count(&configCount)
	if configCount == 0 {
		defaultConfig := models.SystemConfig{
			CompanyName:         "KiosHosting.id",
			SupportEmail:        "support@kioshosting.id",
			CompanyPhone:        "+62 812-3456-7890",
			CompanyAddress:      "Cyber 1 Building, Lantai 5, Kuningan Barat, Jakarta Selatan 12710",
			DefaultCurrency:     "IDR (Rupiah)",
			AutoSuspendDays:     3,
			AutoTerminateDays:   30,
			MidtransEnvironment: "Sandbox",
			MidtransServerKey:   "SB-Mid-server-demo-kioshosting-key",
			MidtransClientKey:   "SB-Mid-client-demo-kioshosting-key",
			ResellerClubID:      "555432",
			ResellerClubAPIKey:  "rc-live-api-key-demo-kioshosting",
			UpdatedAt:           time.Now(),
		}
		bootstrap.DB.Create(&defaultConfig)
	}

	// 2. Demo Staff
	var rinaCount int64
	bootstrap.DB.Model(&models.User{}).Where("email = ?", "cs.rina@kioshosting.id").Count(&rinaCount)
	if rinaCount == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("staff123"), bcrypt.DefaultCost)
		bootstrap.DB.Create(&models.User{
			Name:     "CS Rina",
			Email:    "cs.rina@kioshosting.id",
			Password: string(hash),
			Role:     models.RoleSupportAgent,
			Status:   models.StatusActive,
		})
	}

	var ekoCount int64
	bootstrap.DB.Model(&models.User{}).Where("email = ?", "billing.eko@kioshosting.id").Count(&ekoCount)
	if ekoCount == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("staff123"), bcrypt.DefaultCost)
		bootstrap.DB.Create(&models.User{
			Name:     "Eko Prasetyo",
			Email:    "billing.eko@kioshosting.id",
			Password: string(hash),
			Role:     models.RoleBillingAdmin,
			Status:   models.StatusActive,
		})
	}

	// 3. Demo Webhooks
	var webhookCount int64
	bootstrap.DB.Model(&models.Webhook{}).Count(&webhookCount)
	if webhookCount == 0 {
		bootstrap.DB.Create(&models.Webhook{
			Name:      "Discord Notification Channel",
			URL:       "https://discord.com/api/webhooks/123456789/kioshosting-alerts",
			Events:    "invoice.paid,client.registered,ticket.opened",
			SecretKey: "whsec_discord_production_demo",
			IsActive:  true,
		})
	}
}

// GetSettings loads global system configuration
func GetSettings(c *gin.Context) {
	seedDefaultSettingsIfEmpty()

	var config models.SystemConfig
	if err := bootstrap.DB.First(&config).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil konfigurasi sistem: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"config": config})
}

// UpdateSettingsRequest payload
type UpdateSettingsRequest struct {
	CompanyName         string `json:"company_name"`
	SupportEmail        string `json:"support_email"`
	CompanyPhone        string `json:"company_phone"`
	CompanyAddress      string `json:"company_address"`
	DefaultCurrency     string `json:"default_currency"`
	AutoSuspendDays     int    `json:"auto_suspend_days"`
	AutoTerminateDays   int    `json:"auto_terminate_days"`
	MidtransEnvironment string `json:"midtrans_environment"`
	MidtransServerKey   string `json:"midtrans_server_key"`
	MidtransClientKey   string `json:"midtrans_client_key"`
	ResellerClubID      string `json:"reseller_club_id"`
	ResellerClubAPIKey  string `json:"reseller_club_api_key"`
}

// UpdateSettings saves updated configuration values
func UpdateSettings(c *gin.Context) {
	seedDefaultSettingsIfEmpty()

	var req UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format payload tidak valid: " + err.Error()})
		return
	}

	var config models.SystemConfig
	if err := bootstrap.DB.First(&config).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Konfigurasi tidak ditemukan"})
		return
	}

	updates := map[string]any{
		"company_name":         strings.TrimSpace(req.CompanyName),
		"support_email":        strings.TrimSpace(req.SupportEmail),
		"company_phone":        strings.TrimSpace(req.CompanyPhone),
		"company_address":      strings.TrimSpace(req.CompanyAddress),
		"default_currency":     strings.TrimSpace(req.DefaultCurrency),
		"auto_suspend_days":    req.AutoSuspendDays,
		"auto_terminate_days":  req.AutoTerminateDays,
		"midtrans_environment": strings.TrimSpace(req.MidtransEnvironment),
		"midtrans_server_key":  strings.TrimSpace(req.MidtransServerKey),
		"midtrans_client_key":  strings.TrimSpace(req.MidtransClientKey),
		"reseller_club_id":     strings.TrimSpace(req.ResellerClubID),
		"reseller_club_api_key": strings.TrimSpace(req.ResellerClubAPIKey),
		"updated_at":           time.Now(),
	}

	if err := bootstrap.DB.Model(&config).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan konfigurasi: " + err.Error()})
		return
	}

	bootstrap.DB.First(&config)
	c.JSON(http.StatusOK, gin.H{
		"config":  config,
		"message": "Pengaturan sistem berhasil diperbarui",
	})
}

// ListWebhooks returns all configured webhook endpoints
func ListWebhooks(c *gin.Context) {
	seedDefaultSettingsIfEmpty()

	var webhooks []models.Webhook
	if err := bootstrap.DB.Order("created_at DESC").Find(&webhooks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar webhook"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"webhooks": webhooks})
}

// CreateWebhookRequest payload
type CreateWebhookRequest struct {
	Name      string `json:"name" binding:"required"`
	URL       string `json:"url" binding:"required"`
	Events    string `json:"events"`
	SecretKey string `json:"secret_key"`
}

// CreateWebhook registers a new webhook
func CreateWebhook(c *gin.Context) {
	var req CreateWebhookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama dan URL webhook wajib diisi"})
		return
	}

	webhook := models.Webhook{
		Name:      strings.TrimSpace(req.Name),
		URL:       strings.TrimSpace(req.URL),
		Events:    strings.TrimSpace(req.Events),
		SecretKey: strings.TrimSpace(req.SecretKey),
		IsActive:  true,
	}

	if webhook.Events == "" {
		webhook.Events = "all"
	}

	if err := bootstrap.DB.Create(&webhook).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan webhook: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"webhook": webhook,
		"message": "Webhook berhasil ditambahkan",
	})
}

// DeleteWebhook removes a webhook endpoint
func DeleteWebhook(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID webhook tidak valid"})
		return
	}

	if err := bootstrap.DB.Delete(&models.Webhook{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus webhook"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Webhook berhasil dihapus"})
}

// SafeStaffUser response DTO
type SafeStaffUser struct {
	ID        uint              `json:"id"`
	Name      string            `json:"name"`
	Email     string            `json:"email"`
	Role      models.Role       `json:"role"`
	Status    models.UserStatus `json:"status"`
	CreatedAt time.Time         `json:"created_at"`
}

// ListStaff returns all team members with internal roles
func ListStaff(c *gin.Context) {
	seedDefaultSettingsIfEmpty()

	var staffUsers []models.User
	if err := bootstrap.DB.Where("role != ?", models.RoleUser).Order("role ASC, id ASC").Find(&staffUsers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar staff"})
		return
	}

	safe := make([]SafeStaffUser, 0, len(staffUsers))
	for _, u := range staffUsers {
		safe = append(safe, SafeStaffUser{
			ID:        u.ID,
			Name:      u.Name,
			Email:     u.Email,
			Role:      u.Role,
			Status:    u.Status,
			CreatedAt: u.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"staff": safe})
}

// CreateStaffRequest payload
type CreateStaffRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

// CreateStaff registers a new team member
func CreateStaff(c *gin.Context) {
	var req CreateStaffRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Seluruh kolom Nama, Email, Password, dan Role wajib diisi"})
		return
	}

	var existing models.User
	if err := bootstrap.DB.Where("email = ?", strings.ToLower(strings.TrimSpace(req.Email))).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah terdaftar di sistem"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi kata sandi"})
		return
	}

	role := models.Role(req.Role)
	if role != models.RoleSuperadmin && role != models.RoleSupportAgent && role != models.RoleBillingAdmin {
		role = models.RoleSupportAgent
	}

	newStaff := models.User{
		Name:     strings.TrimSpace(req.Name),
		Email:    strings.ToLower(strings.TrimSpace(req.Email)),
		Password: string(hashed),
		Role:     role,
		Status:   models.StatusActive,
	}

	if err := bootstrap.DB.Create(&newStaff).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan staff: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"user": SafeStaffUser{
			ID:        newStaff.ID,
			Name:      newStaff.Name,
			Email:     newStaff.Email,
			Role:      newStaff.Role,
			Status:    newStaff.Status,
			CreatedAt: newStaff.CreatedAt,
		},
		"message": "Staff baru berhasil ditambahkan",
	})
}

// UpdateStaffRole modifies an existing staff role or status
func UpdateStaffRole(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID staff tidak valid"})
		return
	}

	var user models.User
	if err := bootstrap.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Staff tidak ditemukan"})
		return
	}

	var req struct {
		Name   string `json:"name"`
		Role   string `json:"role"`
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	// Owner safeguard: Cannot downgrade or suspend superadmin ID 1 or admin@kioshosting.id
	if (user.ID == 1 || user.Email == "admin@kioshosting.id") && (req.Role != "" && req.Role != string(models.RoleSuperadmin) || req.Status == string(models.StatusSuspended)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akun Owner Utama tidak dapat diubah rolenya atau dinonaktifkan"})
		return
	}

	updates := map[string]any{"updated_at": time.Now()}
	if req.Name != "" {
		updates["name"] = strings.TrimSpace(req.Name)
	}
	if req.Role != "" {
		updates["role"] = models.Role(req.Role)
	}
	if req.Status != "" {
		updates["status"] = models.UserStatus(req.Status)
	}

	if err := bootstrap.DB.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui data staff: " + err.Error()})
		return
	}

	bootstrap.DB.First(&user, id)
	c.JSON(http.StatusOK, gin.H{
		"user": SafeStaffUser{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      user.Role,
			Status:    user.Status,
			CreatedAt: user.CreatedAt,
		},
		"message": "Data staff berhasil diperbarui",
	})
}

// DeleteStaff removes a staff member (with owner protection)
func DeleteStaff(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID staff tidak valid"})
		return
	}

	var user models.User
	if err := bootstrap.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Staff tidak ditemukan"})
		return
	}

	// Owner safeguard
	if user.ID == 1 || user.Email == "admin@kioshosting.id" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akun Owner Utama tidak dapat dihapus"})
		return
	}

	if err := bootstrap.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus staff"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Staff berhasil dihapus"})
}
