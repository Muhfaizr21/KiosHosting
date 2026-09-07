package middleware

import (
	"net/http"
	"strings"

	"kioshosting-backend/bootstrap"
	"kioshosting-backend/app/models"
	"kioshosting-backend/app/services"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Header Authorization dibutuhkan"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Format Authorization salah"})
			return
		}

		userID, _, err := services.ParseToken(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Token tidak valid atau kadaluarsa"})
			return
		}

		var user models.User
		if err := bootstrap.DB.First(&user, userID).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "User tidak ditemukan"})
			return
		}

		c.Set("user", gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  string(user.Role),
		})
		c.Set("userID", user.ID)
		c.Set("role", string(user.Role))
		c.Next()
	}
}

func RequireRole(roles ...models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		val, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Akses ditolak"})
			return
		}

		userRole := models.Role(val.(string))
		for _, r := range roles {
			if userRole == r {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Akses ditolak untuk role ini"})
	}
}
