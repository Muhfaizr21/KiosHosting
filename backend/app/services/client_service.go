package services

import (
	"errors"
	"strings"

	"kioshosting-backend/app/dto"
	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"

	"gorm.io/gorm"
)

var allowedSortCols = map[string]string{
	"created_at": "created_at",
	"email":      "email",
	"name":       "name",
	"id":         "id",
}

func ListClients(q dto.ListClientsQuery) (dto.ListClientsResponse, error) {
	page := q.Page
	if page < 1 {
		page = 1
	}
	perPage := q.PerPage
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}
	qStr := strings.TrimSpace(q.Q)
	status := strings.ToLower(strings.TrimSpace(q.Status))

	sortCol := allowedSortCols[strings.ToLower(q.SortBy)]
	if sortCol == "" {
		sortCol = "created_at"
	}
	sortDir := strings.ToLower(q.SortDir)
	if sortDir != "asc" && sortDir != "desc" {
		sortDir = "desc"
	}

	base := bootstrap.DB.Model(&models.User{}).Where("role = ?", models.RoleUser)
	if qStr != "" {
		like := "%" + qStr + "%"
		base = base.Where("(name ILIKE ? OR email ILIKE ?)", like, like)
	}
	if status == "active" || status == "suspended" || status == "terminated" {
		base = base.Where("status = ?", status)
	}

	var total int64
	if err := cloneDB(base).Count(&total).Error; err != nil {
		return dto.ListClientsResponse{}, err
	}

	var rows []models.User
	if err := base.Order(sortCol + " " + sortDir).
		Offset((page - 1) * perPage).
		Limit(perPage).
		Find(&rows).Error; err != nil {
		return dto.ListClientsResponse{}, err
	}

	data := make([]ClientResponse, 0, len(rows))
	for _, u := range rows {
		data = append(data, toClientResponse(u))
	}

	totalPages := 0
	if total > 0 {
		totalPages = int((total + int64(perPage) - 1) / int64(perPage))
	}

	return dto.ListClientsResponse{
		Data: data,
		Meta: dto.PaginationMeta{Page: page, PerPage: perPage, Total: total, TotalPages: totalPages},
	}, nil
}

type ClientResponse = dto.ClientResponse

func toClientResponse(u models.User) dto.ClientResponse {
	return dto.ClientResponse{
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		Role:      string(u.Role),
		Status:    string(u.Status),
		CreatedAt: u.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func cloneDB(db *gorm.DB) *gorm.DB {
	return db.Session(&gorm.Session{})
}

func GetClientByID(id uint) (dto.ClientResponse, error) {
	var u models.User
	if err := bootstrap.DB.First(&u, id).Error; err != nil {
		return dto.ClientResponse{}, err
	}
	return toClientResponse(u), nil
}

func CreateClient(req dto.CreateClientRequest) (dto.ClientResponse, error) {
	name := strings.TrimSpace(req.Name)
	email := NormalizeEmail(req.Email)
	password := strings.TrimSpace(req.Password)

	if len(name) < 3 {
		return dto.ClientResponse{}, errors.New("nama minimal 3 karakter")
	}
	if !strings.Contains(email, "@") {
		return dto.ClientResponse{}, errors.New("format email tidak valid")
	}
	if len(password) < 6 {
		return dto.ClientResponse{}, errors.New("password minimal 6 karakter")
	}

	var count int64
	bootstrap.DB.Model(&models.User{}).Where("email = ?", email).Count(&count)
	if count > 0 {
		return dto.ClientResponse{}, ErrEmailTaken
	}

	hash, err := HashPassword(password)
	if err != nil {
		return dto.ClientResponse{}, err
	}

	status := models.StatusActive
	reqStatus := strings.ToLower(strings.TrimSpace(req.Status))
	if reqStatus == "suspended" {
		status = models.StatusSuspended
	} else if reqStatus == "terminated" {
		status = models.StatusTerminated
	}

	role := models.RoleUser
	if strings.ToLower(strings.TrimSpace(req.Role)) == "superadmin" {
		role = models.RoleSuperadmin
	}

	newUser := models.User{
		Name:     name,
		Email:    email,
		Password: hash,
		Role:     role,
		Status:   status,
	}

	if err := bootstrap.DB.Create(&newUser).Error; err != nil {
		return dto.ClientResponse{}, err
	}

	return toClientResponse(newUser), nil
}

func UpdateClient(id uint, req dto.UpdateClientRequest) (dto.ClientResponse, error) {
	var u models.User
	if err := bootstrap.DB.First(&u, id).Error; err != nil {
		return dto.ClientResponse{}, err
	}

	name := strings.TrimSpace(req.Name)
	if name != "" {
		if len(name) < 3 {
			return dto.ClientResponse{}, errors.New("nama minimal 3 karakter")
		}
		u.Name = name
	}

	email := NormalizeEmail(req.Email)
	if email != "" && email != u.Email {
		if !strings.Contains(email, "@") {
			return dto.ClientResponse{}, errors.New("format email tidak valid")
		}
		var count int64
		bootstrap.DB.Model(&models.User{}).Where("email = ? AND id != ?", email, id).Count(&count)
		if count > 0 {
			return dto.ClientResponse{}, ErrEmailTaken
		}
		u.Email = email
	}

	password := strings.TrimSpace(req.Password)
	if password != "" {
		if len(password) < 6 {
			return dto.ClientResponse{}, errors.New("password minimal 6 karakter")
		}
		hash, err := HashPassword(password)
		if err != nil {
			return dto.ClientResponse{}, err
		}
		u.Password = hash
	}

	reqStatus := strings.ToLower(strings.TrimSpace(req.Status))
	if reqStatus == "active" {
		u.Status = models.StatusActive
	} else if reqStatus == "suspended" {
		u.Status = models.StatusSuspended
	} else if reqStatus == "terminated" {
		u.Status = models.StatusTerminated
	}

	reqRole := strings.ToLower(strings.TrimSpace(req.Role))
	if reqRole == "user" {
		u.Role = models.RoleUser
	} else if reqRole == "superadmin" {
		u.Role = models.RoleSuperadmin
	}

	if err := bootstrap.DB.Save(&u).Error; err != nil {
		return dto.ClientResponse{}, err
	}

	return toClientResponse(u), nil
}

func UpdateClientStatus(id uint, status string) (dto.ClientResponse, error) {
	var u models.User
	if err := bootstrap.DB.First(&u, id).Error; err != nil {
		return dto.ClientResponse{}, err
	}

	statusLower := strings.ToLower(strings.TrimSpace(status))
	var newStatus models.UserStatus
	switch statusLower {
	case "active":
		newStatus = models.StatusActive
	case "suspended":
		newStatus = models.StatusSuspended
	case "terminated":
		newStatus = models.StatusTerminated
	default:
		return dto.ClientResponse{}, errors.New("status tidak valid (pilihan: active, suspended, terminated)")
	}

	if err := bootstrap.DB.Model(&u).Update("status", newStatus).Error; err != nil {
		return dto.ClientResponse{}, err
	}
	u.Status = newStatus
	return toClientResponse(u), nil
}

func DeleteClient(id uint) error {
	var u models.User
	if err := bootstrap.DB.First(&u, id).Error; err != nil {
		return err
	}

	if u.Role == models.RoleSuperadmin {
		return errors.New("tidak dapat menghapus akun superadmin")
	}

	tx := bootstrap.DB.Begin()
	if err := tx.Where("user_id = ?", id).Delete(&models.Invoice{}).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Where("user_id = ?", id).Delete(&models.UserService{}).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Where("user_id = ?", id).Delete(&models.RegisteredDomain{}).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Where("user_id = ?", id).Delete(&models.Ticket{}).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Where("user_id = ?", id).Delete(&models.DNSRecord{}).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Delete(&models.User{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
