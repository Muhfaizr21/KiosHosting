package controllers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"
	"kioshosting-backend/app/services"

	"github.com/gin-gonic/gin"
)

// MeInvoices returns invoices scoped to the current user
func MeInvoices(c *gin.Context) {
	userID, _ := c.Get("userID")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 { page = 1 }
	if limit < 1 || limit > 100 { limit = 20 }
	offset := (page - 1) * limit

	var total int64
	bootstrap.DB.Model(&models.Invoice{}).Where("user_id = ?", userID).Count(&total)

	var invoices []models.Invoice
	bootstrap.DB.Where("user_id = ?", userID).Order("created_at desc").Offset(offset).Limit(limit).Find(&invoices)

	var result []gin.H
	for _, inv := range invoices {
		result = append(result, gin.H{
			"id":     inv.ID,
			"amount": inv.Amount,
			"status": string(inv.Status),
			"due":    inv.DueDate.Format("2006-01-02"),
			"date":   inv.CreatedAt.Format("2006-01-02"),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data": result,
		"total": total,
		"page":  page,
		"limit": limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

// MeServices returns hosting services scoped to the current user
func MeServices(c *gin.Context) {
	userID, _ := c.Get("userID")
	status := c.DefaultQuery("status", "all")

	query := bootstrap.DB.Model(&models.UserService{}).
		Preload("Plan").Preload("ServerConnector").
		Where("user_id = ?", userID)

	if status != "all" && status != "" {
		query = query.Where("status = ?", status)
	}

	var services []models.UserService
	query.Order("created_at desc").Find(&services)

	var result []gin.H
	for _, svc := range services {
		result = append(result, gin.H{
			"id":                 svc.ID,
			"domain":             svc.Domain,
			"status":             string(svc.Status),
			"plan":               svc.Plan.Name,
			"server":             svc.ServerConnector.Name,
			"disk_limit":         svc.DiskLimitMB,
			"disk_usage":         svc.DiskUsageMB,
			"bandwidth_limit":    svc.BandwidthLimitMB,
			"bandwidth_usage":    svc.BandwidthUsageMB,
			"next_due":           svc.NextDueDate.Format("2006-01-02"),
			"suspend_reason":     svc.SuspendReason,
			"username":           svc.Username,
			"ip_address":         svc.IPAddress,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// MeServiceDetail returns a single service detail (masked credentials)
func MeServiceDetail(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")

	var svc models.UserService
	if err := bootstrap.DB.Preload("Plan").Preload("ServerConnector").
		Where("id = ? AND user_id = ?", id, userID).First(&svc).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Layanan tidak ditemukan"})
		return
	}

	maskedPass := ""
	if len(svc.PasswordHash) > 6 {
		maskedPass = svc.PasswordHash[:3] + strings.Repeat("*", len(svc.PasswordHash)-6) + svc.PasswordHash[len(svc.PasswordHash)-3:]
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                 svc.ID,
		"domain":             svc.Domain,
		"status":             string(svc.Status),
		"plan":               svc.Plan.Name,
		"server":             svc.ServerConnector.Name,
		"username":           svc.Username,
		"password_masked":    maskedPass,
		"ip_address":         svc.IPAddress,
		"disk_limit":         svc.DiskLimitMB,
		"disk_usage":         svc.DiskUsageMB,
		"bandwidth_limit":    svc.BandwidthLimitMB,
		"bandwidth_usage":    svc.BandwidthUsageMB,
		"next_due":           svc.NextDueDate.Format("2006-01-02"),
		"billing_cycle":      svc.BillingCycle,
		"ns1":                svc.ServerConnector.Nameserver1,
		"ns2":                svc.ServerConnector.Nameserver2,
		"suspend_reason":     svc.SuspendReason,
	})
}

// MeTickets returns tickets scoped to the current user
func MeTickets(c *gin.Context) {
	userID, _ := c.Get("userID")

	var tickets []models.Ticket
	bootstrap.DB.Where("user_id = ?", userID).Preload("Replies").Order("created_at desc").Find(&tickets)

	var result []gin.H
	for _, t := range tickets {
		result = append(result, gin.H{
			"id":          t.ID,
			"code":        t.Code,
			"subject":     t.Subject,
			"department":  t.Department,
			"priority":    t.Priority,
			"status":      string(t.Status),
			"message":     t.Message,
			"reply_count": t.ReplyCount,
			"created_at":  t.CreatedAt.Format("2006-01-02 15:04"),
			"replies":     t.Replies,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// MeCreateTicket creates a ticket scoped to the current user
func MeCreateTicket(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var input struct {
		Subject    string `json:"subject" binding:"required"`
		Department string `json:"department" binding:"required"`
		Priority   string `json:"priority"`
		Message    string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	priority := input.Priority
	if priority == "" {
		priority = "Medium"
	}

	code := "#T-" + strconv.Itoa(int(time.Now().UnixNano()%10000+1000))

	ticket := models.Ticket{
		Code:       code,
		UserID:     userID,
		Subject:    input.Subject,
		Department: models.TicketDepartment(input.Department),
		Priority:   models.TicketPriority(priority),
		Status:     models.TicketStatusOpen,
		Message:    input.Message,
		ReplyCount: 0,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := bootstrap.DB.Create(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal membuat tiket"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Tiket berhasil dibuat", "data": gin.H{"id": ticket.ID, "code": ticket.Code}})
}

// MeReplyTicket replies to a user's own ticket
func MeReplyTicket(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)
	ticketID := c.Param("id")

	var ticket models.Ticket
	if err := bootstrap.DB.Where("id = ? AND user_id = ?", ticketID, userID).First(&ticket).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Tiket tidak ditemukan"})
		return
	}

	var input struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Pesan wajib diisi"})
		return
	}

	reply := models.TicketReply{
		TicketID:  ticket.ID,
		UserID:    userID,
		IsAdmin:   false,
		Message:   input.Message,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := bootstrap.DB.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengirim balasan"})
		return
	}

	bootstrap.DB.Model(&ticket).Update("reply_count", ticket.ReplyCount+1)
	bootstrap.DB.Model(&ticket).Update("updated_at", time.Now())

	c.JSON(http.StatusCreated, gin.H{"message": "Balasan berhasil dikirim"})
}

// MeSettings returns sanitized user profile
func MeSettings(c *gin.Context) {
	userID, _ := c.Get("userID")

	var user models.User
	if err := bootstrap.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": toUserResponse(user)})
}

// MeUpdateSettings updates user profile fields
func MeUpdateSettings(c *gin.Context) {
	userID, _ := c.Get("userID")

	var input struct {
		Name  string `json:"name"`
		Email string `json:"email"`
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	var user models.User
	if err := bootstrap.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User tidak ditemukan"})
		return
	}

	updates := map[string]any{"updated_at": time.Now()}
	if input.Name != "" {
		updates["name"] = strings.TrimSpace(input.Name)
	}
	if input.Email != "" {
		newEmail := services.NormalizeEmail(input.Email)
		if newEmail != user.Email {
			var count int64
			bootstrap.DB.Model(&models.User{}).Where("email = ? AND id != ?", newEmail, user.ID).Count(&count)
			if count > 0 {
				c.JSON(http.StatusBadRequest, gin.H{"message": "Email sudah digunakan"})
				return
			}
			updates["email"] = newEmail
		}
	}
	if input.NewPassword != "" {
		if input.CurrentPassword == "" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Password lama wajib diisi"})
			return
		}
		if !services.CheckPassword(user.Password, input.CurrentPassword) {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Password lama salah"})
			return
		}
		hash, err := services.HashPassword(input.NewPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memproses password baru"})
			return
		}
		updates["password"] = hash
	}

	bootstrap.DB.Model(&user).Updates(updates)
	bootstrap.DB.First(&user, userID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diperbarui",
		"user":    toUserResponse(user),
	})
}
