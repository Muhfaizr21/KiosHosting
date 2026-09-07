package models

import (
	"time"
)

type SystemConfig struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	CompanyName         string    `gorm:"type:varchar(100);default:'KiosHosting.id'" json:"company_name"`
	SupportEmail        string    `gorm:"type:varchar(100);default:'support@kioshosting.id'" json:"support_email"`
	CompanyPhone        string    `gorm:"type:varchar(50);default:'+62 812-3456-7890'" json:"company_phone"`
	CompanyAddress      string    `gorm:"type:varchar(255);default:'Cyber 1 Building, Jakarta Selatan, Indonesia'" json:"company_address"`
	DefaultCurrency     string    `gorm:"type:varchar(50);default:'IDR (Rupiah)'" json:"default_currency"`
	AutoSuspendDays     int       `gorm:"default:3" json:"auto_suspend_days"`
	AutoTerminateDays   int       `gorm:"default:30" json:"auto_terminate_days"`
	MidtransEnvironment string    `gorm:"type:varchar(20);default:'Sandbox'" json:"midtrans_environment"`
	MidtransServerKey   string    `gorm:"type:varchar(255);default:'SB-Mid-server-xxxxxxxxxxxx'" json:"midtrans_server_key"`
	MidtransClientKey   string    `gorm:"type:varchar(255);default:'SB-Mid-client-xxxxxxxxxxxx'" json:"midtrans_client_key"`
	ResellerClubID      string    `gorm:"type:varchar(50);default:'555432'" json:"reseller_club_id"`
	ResellerClubAPIKey  string    `gorm:"type:varchar(255);default:'rc-api-key-xxxxxxxxxxxx'" json:"reseller_club_api_key"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type Webhook struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name"`
	URL       string    `gorm:"type:varchar(255);not null" json:"url"`
	Events    string    `gorm:"type:varchar(255);default:'all'" json:"events"`
	SecretKey string    `gorm:"type:varchar(100)" json:"secret_key"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (SystemConfig) TableName() string {
	return "system_configs"
}

func (Webhook) TableName() string {
	return "webhooks"
}
