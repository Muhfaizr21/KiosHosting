package bootstrap

import (
	"fmt"
	"log"

	"kioshosting-backend/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	host := config.GetEnv("DB_HOST", "127.0.0.1")
	port := config.GetEnv("DB_PORT", "5432")
	user := config.GetEnv("DB_USER", "postgres")
	password := config.GetEnv("DB_PASSWORD", "")
	dbname := config.GetEnv("DB_NAME", "kioshosting")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	fmt.Println("🚀 Database connected successfully")
}
