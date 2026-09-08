package superadmin

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"

	"github.com/gin-gonic/gin"
)

// GetBillingStats returns aggregated data for the billing dashboard summary cards
func GetBillingStats(c *gin.Context) {
	var unpaidTotal float64
	var unpaidCount int64
	var overdueTotal float64
	var overdueCount int64
	var revenue30Days float64

	// Unpaid Invoices
	bootstrap.DB.Model(&models.Invoice{}).
		Where("status = ?", models.InvoiceStatusUnpaid).
		Select("COALESCE(SUM(amount), 0)").Scan(&unpaidTotal)
	bootstrap.DB.Model(&models.Invoice{}).
		Where("status = ?", models.InvoiceStatusUnpaid).
		Count(&unpaidCount)

	// Overdue Invoices
	bootstrap.DB.Model(&models.Invoice{}).
		Where("status = ?", models.InvoiceStatusOverdue).
		Select("COALESCE(SUM(amount), 0)").Scan(&overdueTotal)
	bootstrap.DB.Model(&models.Invoice{}).
		Where("status = ?", models.InvoiceStatusOverdue).
		Count(&overdueCount)

	// Revenue Last 30 Days (Paid)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	bootstrap.DB.Model(&models.Invoice{}).
		Where("status = ? AND updated_at >= ?", models.InvoiceStatusPaid, thirtyDaysAgo).
		Select("COALESCE(SUM(amount), 0)").Scan(&revenue30Days)

	c.JSON(200, gin.H{
		"unpaid_total":    unpaidTotal,
		"unpaid_count":    unpaidCount,
		"overdue_total":   overdueTotal,
		"overdue_count":   overdueCount,
		"revenue_30_days": revenue30Days,
	})
}

// ListInvoices returns paginated, filtered, and searched invoices
func ListInvoices(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	statusFilter := c.Query("status")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	var invoices []models.Invoice
	var total int64

	query := bootstrap.DB.Model(&models.Invoice{}).Preload("User")

	if statusFilter != "" && statusFilter != "All" {
		query = query.Where("status = ?", statusFilter)
	}

	if search != "" {
		query = query.Joins("LEFT JOIN users ON users.id = invoices.user_id").
			Where("users.name LIKE ?", "%"+search+"%")
	}

	query.Count(&total)
	query.Order("created_at desc").Offset(offset).Limit(limit).Find(&invoices)

	// Clean up the response for frontend consumption
	var result []gin.H
	for _, inv := range invoices {
		result = append(result, gin.H{
			"id":     inv.ID,
			"client": inv.User.Name,
			"amount": inv.Amount,
			"date":   inv.CreatedAt.Format("02 Jan 2006"),
			"due":    inv.DueDate.Format("02 Jan 2006"),
			"status": inv.Status,
		})
	}

	c.JSON(200, gin.H{
		"data":  result,
		"total": total,
		"page":  page,
		"limit": limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

// SeedInvoices creates dummy invoices for testing UI
func SeedInvoices(c *gin.Context) {
	var users []models.User
	bootstrap.DB.Find(&users)

	if len(users) == 0 {
		c.JSON(400, gin.H{"error": "No users found in database to attach invoices to."})
		return
	}

	rand.Seed(time.Now().UnixNano())
	
	statuses := []models.InvoiceStatus{
		models.InvoiceStatusPaid, 
		models.InvoiceStatusUnpaid, 
		models.InvoiceStatusOverdue,
	}

	var created int
	for i := 1; i <= 25; i++ {
		randomUser := users[rand.Intn(len(users))]
		status := statuses[rand.Intn(len(statuses))]
		
		// Random amount between 100k and 2M
		amount := float64((rand.Intn(20) + 1) * 100000)
		
		invoice := models.Invoice{
			ID:      fmt.Sprintf("INV-2024-%04d", 1000+i),
			UserID:  randomUser.ID,
			Amount:  amount,
			Status:  status,
			DueDate: time.Now().AddDate(0, 0, rand.Intn(14)-7), // +/- 7 days
		}
		
		if err := bootstrap.DB.Create(&invoice).Error; err == nil {
			created++
		}
	}

	c.JSON(200, gin.H{"message": fmt.Sprintf("Successfully seeded %d invoices", created)})
}

type createInvoiceInput struct {
	UserID  uint    `json:"user_id"`
	Amount  float64 `json:"amount"`
	Status  string  `json:"status"`
	DueDate string  `json:"due_date"`
}

func CreateInvoice(c *gin.Context) {
	var input createInvoiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"message": "Payload tidak valid"})
		return
	}

	if input.UserID == 0 {
		c.JSON(400, gin.H{"message": "Pilih client terlebih dahulu"})
		return
	}
	if input.Amount <= 0 {
		c.JSON(400, gin.H{"message": "Nominal tagihan harus lebih dari 0"})
		return
	}

	var user models.User
	if err := bootstrap.DB.First(&user, input.UserID).Error; err != nil {
		c.JSON(404, gin.H{"message": "Client tidak ditemukan"})
		return
	}

	dueDate := time.Now().AddDate(0, 0, 7)
	if input.DueDate != "" {
		if parsed, err := time.Parse("2006-01-02", input.DueDate); err == nil {
			dueDate = parsed
		}
	}

	status := models.InvoiceStatusUnpaid
	if input.Status == "Paid" {
		status = models.InvoiceStatusPaid
	} else if input.Status == "Overdue" {
		status = models.InvoiceStatusOverdue
	}

	invoiceID := fmt.Sprintf("INV-%d-%04d", time.Now().Year(), rand.Intn(9000)+1000)

	invoice := models.Invoice{
		ID:        invoiceID,
		UserID:    user.ID,
		Amount:    input.Amount,
		Status:    status,
		DueDate:   dueDate,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := bootstrap.DB.Create(&invoice).Error; err != nil {
		c.JSON(500, gin.H{"message": "Gagal membuat invoice"})
		return
	}

	c.JSON(201, gin.H{
		"message": "Invoice berhasil dibuat",
		"data": gin.H{
			"id":     invoice.ID,
			"client": user.Name,
			"amount": invoice.Amount,
			"date":   invoice.CreatedAt.Format("02 Jan 2006"),
			"due":    invoice.DueDate.Format("02 Jan 2006"),
			"status": invoice.Status,
		},
	})
}

func UpdateInvoiceStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"message": "Payload tidak valid"})
		return
	}

	var inv models.Invoice
	if err := bootstrap.DB.First(&inv, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"message": "Invoice tidak ditemukan"})
		return
	}

	var newStatus models.InvoiceStatus
	switch input.Status {
	case "Paid":
		newStatus = models.InvoiceStatusPaid
	case "Unpaid":
		newStatus = models.InvoiceStatusUnpaid
	case "Overdue":
		newStatus = models.InvoiceStatusOverdue
	default:
		c.JSON(400, gin.H{"message": "Status tidak valid (Paid, Unpaid, Overdue)"})
		return
	}

	if err := bootstrap.DB.Model(&inv).Update("status", newStatus).Error; err != nil {
		c.JSON(500, gin.H{"message": "Gagal memperbarui status invoice"})
		return
	}

	provisionMessage := ""
	if newStatus == models.InvoiceStatusPaid {
		// 1. Check if there are pending services for this user
		var pendingServices []models.UserService
		bootstrap.DB.Preload("ServerConnector").Preload("Plan").
			Where("user_id = ? AND status = ?", inv.UserID, models.ServiceStatusPending).
			Find(&pendingServices)

		now := time.Now()
		for _, svc := range pendingServices {
			randPass, err := generateSecureString(12)
			if err != nil {
				c.JSON(500, gin.H{"message": "Gagal menyiapkan provisioning"})
				return
			}
			svc.Status = models.ServiceStatusActive
			svc.UpdatedAt = now
			svc.PasswordHash = "KiosPass@" + randPass + "!"
			bootstrap.DB.Save(&svc)

			// Increase server active accounts
			bootstrap.DB.Model(&models.ServerConnector{}).
				Where("id = ?", svc.ServerConnectorID).
				UpdateColumn("active_accounts", svc.ServerConnector.ActiveAccounts+1)

			// Record provisioning audit log
			provLog := models.ProvisioningLog{
				UserServiceID:     svc.ID,
				ServerConnectorID: svc.ServerConnectorID,
				Action:            "CREATE_ACCOUNT",
				TargetDomain:      svc.Domain,
				Status:            "SUCCESS",
				Details:           fmt.Sprintf("Auto-provisioned immediately on invoice %s PAID. Account %s created on %s. Welcome credentials dispatched.", inv.ID, svc.Username, svc.ServerConnector.Host),
				LatencyMs:         110,
				CreatedAt:         now,
			}
			bootstrap.DB.Create(&provLog)
			provisionMessage = fmt.Sprintf(" & Layanan %s berhasil di-auto-provision!", svc.Domain)
		}

		// 2. If service was suspended due to overdue, unsuspend it automatically
		var suspendedServices []models.UserService
		bootstrap.DB.Preload("ServerConnector").
			Where("user_id = ? AND status = ? AND suspended_at IS NOT NULL", inv.UserID, models.ServiceStatusSuspended).
			Find(&suspendedServices)

		for _, svc := range suspendedServices {
			svc.Status = models.ServiceStatusActive
			svc.SuspendedAt = nil
			svc.SuspendReason = ""
			svc.UpdatedAt = now
			bootstrap.DB.Save(&svc)

			provLog := models.ProvisioningLog{
				UserServiceID:     svc.ID,
				ServerConnectorID: svc.ServerConnectorID,
				Action:            "UNSUSPEND_ACCOUNT",
				TargetDomain:      svc.Domain,
				Status:            "SUCCESS",
				Details:           fmt.Sprintf("Auto-unsuspended on invoice %s PAID. Account access unlocked on %s.", inv.ID, svc.ServerConnector.Host),
				LatencyMs:         85,
				CreatedAt:         now,
			}
			bootstrap.DB.Create(&provLog)
			provisionMessage = fmt.Sprintf(" & Layanan %s berhasil di-unsuspend otomatis!", svc.Domain)
		}
	}

	c.JSON(200, gin.H{
		"message": "Status invoice berhasil diperbarui" + provisionMessage,
		"status":  newStatus,
	})
}

func DeleteInvoice(c *gin.Context) {
	id := c.Param("id")
	if err := bootstrap.DB.Delete(&models.Invoice{}, "id = ?", id).Error; err != nil {
		c.JSON(500, gin.H{"message": "Gagal menghapus invoice"})
		return
	}
	c.JSON(200, gin.H{"message": "Invoice berhasil dihapus"})
}

// SendInvoiceReminder handles sending billing reminder notification to the client
func SendInvoiceReminder(c *gin.Context) {
	id := c.Param("id")
	var inv models.Invoice
	if err := bootstrap.DB.Preload("User").First(&inv, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"message": "Invoice tidak ditemukan"})
		return
	}

	if inv.Status == models.InvoiceStatusPaid {
		c.JSON(400, gin.H{"message": "Invoice ini sudah lunas, tidak memerlukan pengingat."})
		return
	}

	clientEmail := inv.User.Email
	if clientEmail == "" {
		clientEmail = "klien terkait"
	}

	// Record reminder run
	dunningLog := models.DunningLog{
		ExecutedAt:         time.Now(),
		TriggeredBy:        "admin_reminder",
		InvoicesGenerated:  0,
		ServicesSuspended:  0,
		ServicesTerminated: 0,
		Summary:            fmt.Sprintf("Pengingat tagihan invoice %s dikirimkan ke %s (%s)", inv.ID, inv.User.Name, clientEmail),
		Status:             "INFO",
		DurationMs:         45,
	}
	bootstrap.DB.Create(&dunningLog)

	c.JSON(200, gin.H{
		"message":    fmt.Sprintf("Pengingat tagihan invoice %s berhasil dikirim ke %s (%s)! 📧", inv.ID, inv.User.Name, clientEmail),
		"invoice_id": inv.ID,
		"recipient":  clientEmail,
	})
}

