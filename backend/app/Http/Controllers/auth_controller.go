package controllers

import (
	"net/http"
	"strings"

	"kioshosting-backend/bootstrap"
	"kioshosting-backend/app/models"
	"kioshosting-backend/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type authInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	Token string       `json:"token"`
	User  userResponse  `json:"user"`
}

type userResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

func Register(c *gin.Context) {
	var input authInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	name := strings.TrimSpace(input.Name)
	email := services.NormalizeEmail(input.Email)
	password := strings.TrimSpace(input.Password)
	if len(name) < 3 || !strings.Contains(email, "@") || len(password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data registrasi tidak valid"})
		return
	}

	var count int64
	bootstrap.DB.Model(&models.User{}).Where("email = ?", email).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"message": services.ErrEmailTaken.Error()})
		return
	}

	hash, err := services.HashPassword(password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memproses password"})
		return
	}

	user := models.User{Name: name, Email: email, Password: hash, Role: models.RoleUser}
	if err := bootstrap.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal membuat akun"})
		return
	}

	respondAuth(c, user)
}

func Login(c *gin.Context) {
	var input authInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	email := services.NormalizeEmail(input.Email)
	password := strings.TrimSpace(input.Password)

	var user models.User
	if err := bootstrap.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"message": services.ErrInvalidCredentials.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal login"})
		return
	}

	if !services.CheckPassword(user.Password, password) {
		c.JSON(http.StatusUnauthorized, gin.H{"message": services.ErrInvalidCredentials.Error()})
		return
	}

	respondAuth(c, user)
}

func Me(c *gin.Context) {
	user, ok := c.Get("user")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Tidak terautentikasi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

func respondAuth(c *gin.Context, user models.User) {
	token, err := services.SignToken(user.ID, string(user.Role), user.Email, user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal membuat token"})
		return
	}
	c.JSON(http.StatusOK, authResponse{Token: token, User: toUserResponse(user)})
}

func toUserResponse(user models.User) userResponse {
	return userResponse{ID: user.ID, Name: user.Name, Email: user.Email, Role: string(user.Role)}
}
