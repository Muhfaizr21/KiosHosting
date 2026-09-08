package superadmin

import (
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"

	"github.com/gin-gonic/gin"
)

func seedDefaultTicketsIfEmpty() {
	var count int64
	bootstrap.DB.Model(&models.Ticket{}).Count(&count)
	if count > 0 {
		return
	}

	var client models.User
	err := bootstrap.DB.Where("role = ?", models.RoleUser).First(&client).Error
	if err != nil {
		// Fallback to first user
		if err := bootstrap.DB.First(&client).Error; err != nil {
			return
		}
	}

	now := time.Now()

	// 1. Open Ticket
	t1 := models.Ticket{
		Code:       "#T-8091",
		UserID:     client.ID,
		Subject:    "Website cannot be accessed after SSL install",
		Department: models.DeptTechnical,
		Priority:   models.PriorityHigh,
		Status:     models.TicketStatusOpen,
		Message:    "Halo tim KiosHosting, setelah saya menginstal sertifikat SSL Let's Encrypt tadi siang, website saya muncul pesan NET::ERR_CERT_COMMON_NAME_INVALID saat dibuka melalui Google Chrome. Mohon bantuannya segera karena website toko kami sedang ada promo kilat.",
		CreatedAt:  now.Add(-15 * time.Minute),
		UpdatedAt:  now.Add(-15 * time.Minute),
	}
	bootstrap.DB.Create(&t1)

	// 2. Answered Ticket with Admin reply
	t2 := models.Ticket{
		Code:       "#T-8090",
		UserID:     client.ID,
		Subject:    "Bagaimana cara upgrade paket hosting ke Bisnis Pro?",
		Department: models.DeptBilling,
		Priority:   models.PriorityLow,
		Status:     models.TicketStatusAnswered,
		Message:    "Halo, saya ingin upgrade dari paket Starter Pro ke Bisnis Pro. Apakah data website saya aman dan otomatis berpindah tanpa downtime?",
		CreatedAt:  now.Add(-2 * time.Hour),
		UpdatedAt:  now.Add(-45 * time.Minute),
	}
	bootstrap.DB.Create(&t2)
	bootstrap.DB.Create(&models.TicketReply{
		TicketID:  t2.ID,
		UserID:    client.ID,
		IsAdmin:   true,
		Message:   "Halo Pak " + client.Name + ",\n\nProses upgrade paket hosting di KiosHosting 100% tanpa downtime dan otomatis! Kapasitas penyimpanan SSD NVMe dan alokasi CPU RAM Anda akan langsung disesuaikan secara instan setelah invoice upgrade dibayarkan.\n\nSilakan buka menu Billing untuk melihat selisih pembayaran, atau balas tiket ini jika ada pertanyaan lanjutan. Terima kasih!",
		CreatedAt: now.Add(-45 * time.Minute),
		UpdatedAt: now.Add(-45 * time.Minute),
	})

	// 3. In Progress Ticket
	t3 := models.Ticket{
		Code:       "#T-8089",
		UserID:     client.ID,
		Subject:    "Domain pointing issue to new node 103.152.112.5",
		Department: models.DeptDomain,
		Priority:   models.PriorityMedium,
		Status:     models.TicketStatusInProgress,
		Message:    "DNS A record sudah saya arahkan ke IP server 103.152.112.5 sejak 4 jam lalu, namun hasil cek global DNS propagation masih belum mengarah ke node baru.",
		CreatedAt:  now.Add(-4 * time.Hour),
		UpdatedAt:  now.Add(-1 * time.Hour),
	}
	bootstrap.DB.Create(&t3)
	bootstrap.DB.Create(&models.TicketReply{
		TicketID:  t3.ID,
		UserID:    client.ID,
		IsAdmin:   true,
		Message:   "Tim teknikal kami saat ini sedang melakukan flush cache DNS pada nameserver pusat kami (ns1.kioshosting.id). Propagasi domain umumnya membutuhkan waktu 1-4 jam. Kami terus pantau hingga resolving stabil.",
		CreatedAt: now.Add(-1 * time.Hour),
		UpdatedAt: now.Add(-1 * time.Hour),
	})

	// 4. Closed Ticket
	t4 := models.Ticket{
		Code:       "#T-8088",
		UserID:     client.ID,
		Subject:    "Payment not verified automatically via VA BCA",
		Department: models.DeptBilling,
		Priority:   models.PriorityHigh,
		Status:     models.TicketStatusClosed,
		Message:    "Saya sudah transfer lewat VA BCA senilai Rp 45.000 tapi status tagihan masih unpaid.",
		CreatedAt:  now.Add(-26 * time.Hour),
		UpdatedAt:  now.Add(-22 * time.Hour),
	}
	bootstrap.DB.Create(&t4)
	bootstrap.DB.Create(&models.TicketReply{
		TicketID:  t4.ID,
		UserID:    client.ID,
		IsAdmin:   true,
		Message:   "Pembayaran telah kami verifikasi manual pada payment gateway dan layanan hosting Anda telah aktif kembali. Tiket ini kami tandai selesai.",
		CreatedAt: now.Add(-22 * time.Hour),
		UpdatedAt: now.Add(-22 * time.Hour),
	})
}

// ListTickets returns all tickets matching filter criteria and overall summary statistics
func ListTickets(c *gin.Context) {
	search := strings.TrimSpace(c.Query("search"))
	status := strings.TrimSpace(c.Query("status"))
	dept := strings.TrimSpace(c.Query("department"))
	priority := strings.TrimSpace(c.Query("priority"))

	query := bootstrap.DB.Model(&models.Ticket{}).Preload("User").Preload("Replies")

	if search != "" {
		s := "%" + strings.ToLower(search) + "%"
		query = query.Joins("LEFT JOIN users ON users.id = tickets.user_id").
			Where("LOWER(tickets.code) LIKE ? OR LOWER(tickets.subject) LIKE ? OR LOWER(users.name) LIKE ? OR LOWER(users.email) LIKE ?", s, s, s, s)
	}

	if status != "" && status != "All" && status != "Semua" {
		query = query.Where("tickets.status = ?", status)
	}

	if dept != "" && dept != "All" && dept != "Semua" {
		query = query.Where("tickets.department = ?", dept)
	}

	if priority != "" && priority != "All" && priority != "Semua" {
		query = query.Where("tickets.priority = ?", priority)
	}

	var tickets []models.Ticket
	if err := query.Order("tickets.created_at DESC").Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar tiket: " + err.Error()})
		return
	}

	for i := range tickets {
		tickets[i].ReplyCount = len(tickets[i].Replies)
	}

	// Calculate overall statistics
	var openCount, inProgressCount, highPriorityCount, closedCount int64
	bootstrap.DB.Model(&models.Ticket{}).Where("status = ?", models.TicketStatusOpen).Count(&openCount)
	bootstrap.DB.Model(&models.Ticket{}).Where("status IN (?)", []string{string(models.TicketStatusInProgress), string(models.TicketStatusAnswered)}).Count(&inProgressCount)
	bootstrap.DB.Model(&models.Ticket{}).Where("priority IN (?)", []string{string(models.PriorityHigh), string(models.PriorityUrgent)}).Count(&highPriorityCount)
	bootstrap.DB.Model(&models.Ticket{}).Where("status = ?", models.TicketStatusClosed).Count(&closedCount)

	c.JSON(http.StatusOK, gin.H{
		"tickets": tickets,
		"stats": gin.H{
			"open_count":          openCount,
			"in_progress_count":   inProgressCount,
			"high_priority_count": highPriorityCount,
			"closed_count":        closedCount,
			"total_count":         len(tickets),
		},
	})
}

// GetTicketDetail retrieves a ticket with its creator and all replies
func GetTicketDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tiket tidak valid"})
		return
	}

	var ticket models.Ticket
	if err := bootstrap.DB.Preload("User").Preload("Replies.User").First(&ticket, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tiket tidak ditemukan"})
		return
	}

	ticket.ReplyCount = len(ticket.Replies)
	c.JSON(http.StatusOK, gin.H{"ticket": ticket})
}

// CreateTicketRequest payload
type CreateTicketRequest struct {
	UserID     uint   `json:"user_id" binding:"required"`
	Subject    string `json:"subject" binding:"required"`
	Department string `json:"department"`
	Priority   string `json:"priority"`
	Message    string `json:"message" binding:"required"`
}

// CreateTicket allows superadmin to open a support ticket
func CreateTicket(c *gin.Context) {
	var req CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input tidak valid: " + err.Error()})
		return
	}

	dept := models.TicketDepartment(req.Department)
	if dept == "" {
		dept = models.DeptTechnical
	}

	prio := models.TicketPriority(req.Priority)
	if prio == "" {
		prio = models.PriorityMedium
	}

	// Generate ticket code e.g. #T-8092
	rand.Seed(time.Now().UnixNano())
	code := fmt.Sprintf("#T-%04d", rand.Intn(9000)+1000)

	ticket := models.Ticket{
		Code:       code,
		UserID:     req.UserID,
		Subject:    strings.TrimSpace(req.Subject),
		Department: dept,
		Priority:   prio,
		Status:     models.TicketStatusOpen,
		Message:    strings.TrimSpace(req.Message),
	}

	if err := bootstrap.DB.Create(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat tiket: " + err.Error()})
		return
	}

	bootstrap.DB.Preload("User").First(&ticket, ticket.ID)
	c.JSON(http.StatusCreated, gin.H{
		"ticket":  ticket,
		"message": "Tiket berhasil dibuat",
	})
}

// ReplyTicketRequest payload
type ReplyTicketRequest struct {
	Message   string `json:"message" binding:"required"`
	SetStatus string `json:"set_status"`
}

// ReplyTicket posts an admin response to a ticket
func ReplyTicket(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tiket tidak valid"})
		return
	}

	var ticket models.Ticket
	if err := bootstrap.DB.First(&ticket, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tiket tidak ditemukan"})
		return
	}

	var req ReplyTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Isi balasan wajib diisi"})
		return
	}

	// Current authenticated user
	userIDVal, exists := c.Get("userID")
	var adminUserID uint = 1
	if exists {
		if uid, ok := userIDVal.(uint); ok {
			adminUserID = uid
		}
	}

	reply := models.TicketReply{
		TicketID: ticket.ID,
		UserID:   adminUserID,
		IsAdmin:  true,
		Message:  strings.TrimSpace(req.Message),
	}

	if err := bootstrap.DB.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan balasan: " + err.Error()})
		return
	}

	// Update ticket status
	newStatus := models.TicketStatusAnswered
	if req.SetStatus != "" {
		newStatus = models.TicketStatus(req.SetStatus)
	}

	bootstrap.DB.Model(&ticket).Updates(map[string]any{
		"status":     newStatus,
		"updated_at": time.Now(),
	})

	// Preload reply user
	bootstrap.DB.Preload("User").First(&reply, reply.ID)
	bootstrap.DB.Preload("User").Preload("Replies.User").First(&ticket, ticket.ID)

	c.JSON(http.StatusOK, gin.H{
		"reply":   reply,
		"ticket":  ticket,
		"message": "Balasan berhasil dikirimkan",
	})
}

// UpdateTicketStatus modifies status and/or priority
func UpdateTicketStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tiket tidak valid"})
		return
	}

	var ticket models.Ticket
	if err := bootstrap.DB.First(&ticket, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tiket tidak ditemukan"})
		return
	}

	var req struct {
		Status   string `json:"status"`
		Priority string `json:"priority"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	updates := map[string]any{"updated_at": time.Now()}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.Priority != "" {
		updates["priority"] = req.Priority
	}

	if err := bootstrap.DB.Model(&ticket).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status: " + err.Error()})
		return
	}

	bootstrap.DB.Preload("User").Preload("Replies.User").First(&ticket, ticket.ID)
	c.JSON(http.StatusOK, gin.H{
		"ticket":  ticket,
		"message": "Status tiket berhasil diperbarui",
	})
}

// DeleteTicket removes a ticket and its cascade replies
func DeleteTicket(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tiket tidak valid"})
		return
	}

	var ticket models.Ticket
	if err := bootstrap.DB.First(&ticket, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tiket tidak ditemukan"})
		return
	}

	if err := bootstrap.DB.Select("Replies").Delete(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus tiket: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tiket berhasil dihapus"})
}
