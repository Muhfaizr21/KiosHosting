package bootstrap

import (
	"fmt"
	"log"

	"kioshosting-backend/app/models"
	"kioshosting-backend/config"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

func Migrate() {
	if err := models.AutoMigrate(DB); err != nil {
		log.Fatalf("❌ Failed to migrate database: %v", err)
	}
	fmt.Println("🚀 Database migrated successfully")
}

func SeedDemoAccounts() {
	var count int64
	DB.Model(&models.User{}).Where("email IN (?)", []string{"admin@kioshosting.id", "budi@gmail.com"}).Count(&count)
	if count >= 2 {
		log.Println("ℹ️  Demo accounts already exist")
		return
	}

	adminRaw, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("❌ Failed to hash admin password: %v", err)
	}
	adminHash := string(adminRaw)
	DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "email"}},
		DoUpdates: clause.Assignments(map[string]any{"password": adminHash, "role": models.RoleSuperadmin, "status": models.StatusActive}),
	}).Create(&models.User{Name: "Admin Utama", Email: "admin@kioshosting.id", Password: adminHash, Role: models.RoleSuperadmin, Status: models.StatusActive})

	userRaw, err := bcrypt.GenerateFromPassword([]byte("user1234"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("❌ Failed to hash user password: %v", err)
	}
	userHash := string(userRaw)
	DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "email"}},
		DoUpdates: clause.Assignments(map[string]any{"password": userHash, "role": models.RoleUser, "status": models.StatusActive}),
	}).Create(&models.User{Name: "Budi Santoso", Email: "budi@gmail.com", Password: userHash, Role: models.RoleUser, Status: models.StatusActive})

	log.Println("ℹ️  Demo accounts seeded")
}
