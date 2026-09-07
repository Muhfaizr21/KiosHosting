package routes

import (
	"kioshosting-backend/app/Http/Controllers"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all the API routes
func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		// Health Check
		api.GET("/ping", controllers.Ping)

		// v1 API Group
		v1 := api.Group("/v1")
		{
			// Example route:
			// v1.GET("/users", controllers.GetUsers)
			_ = v1
		}
	}
}
