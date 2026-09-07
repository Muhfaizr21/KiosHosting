package main

import (
	"fmt"
	"log"
	"time"

	"kioshosting-backend/bootstrap"
	"kioshosting-backend/config"
	"kioshosting-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load Configuration (.env)
	config.LoadConfig()

	// 2. Connect Database + Migrate + Seed
	bootstrap.ConnectDatabase()
	bootstrap.Migrate()
	bootstrap.SeedDemoAccounts()

	// 3. Set Gin mode based on environment
	appEnv := config.GetEnv("APP_ENV", "local")
	if appEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 3. Initialize Router
	router := gin.Default()

	// CORS Config
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 4. Setup Routes
	routes.SetupRoutes(router)

	// 5. Start Server
	port := config.GetEnv("PORT", "8080")
	fmt.Printf("🚀 Starting backend server on port %s in %s mode...\n", port, appEnv)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
