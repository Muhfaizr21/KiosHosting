package main

import (
	"fmt"
	"log"

	"kioshosting-backend/bootstrap"
	"kioshosting-backend/config"
	"kioshosting-backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load Configuration (.env)
	config.LoadConfig()

	// 2. Connect Database
	bootstrap.ConnectDatabase()

	// 3. Set Gin mode based on environment
	appEnv := config.GetEnv("APP_ENV", "local")
	if appEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 3. Initialize Router
	router := gin.Default()

	// 4. Setup Routes
	routes.SetupRoutes(router)

	// 5. Start Server
	port := config.GetEnv("PORT", "8080")
	fmt.Printf("🚀 Starting backend server on port %s in %s mode...\n", port, appEnv)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
