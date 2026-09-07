package superadmin

import (
	"net/http"

	"kioshosting-backend/app/services"

	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	stats, err := services.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "gagal mengambil data dashboard"})
		return
	}
	c.JSON(http.StatusOK, stats)
}
