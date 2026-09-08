package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleSuperadmin   Role = "superadmin"
	RoleSupportAgent Role = "support_agent"
	RoleBillingAdmin Role = "billing_admin"
	RoleUser         Role = "user"
)

type UserStatus string

const (
	StatusActive     UserStatus = "active"
	StatusSuspended  UserStatus = "suspended"
	StatusTerminated UserStatus = "terminated"
)

type User struct {
	ID        uint       `gorm:"primaryKey"`
	Name      string     `gorm:"size:100;not null"`
	Email     string     `gorm:"size:190;uniqueIndex;not null"`
	Password  string     `gorm:"size:255;not null"`
	Role      Role       `gorm:"size:20;not null;default:user"`
	Status    UserStatus `gorm:"size:20;not null;default:active"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (User) TableName() string {
	return "users"
}

// AutoMigrate registers all app models with the database.
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&Invoice{},
		&HostingPlan{},
		&DomainTLD{},
		&Ticket{},
		&TicketReply{},
		&SystemConfig{},
		&Webhook{},
		&BlockedIP{},
		&SecuritySetting{},
		&AccountCOA{},
		&CashflowTransaction{},
		&ServerConnector{},
		&UserService{},
		&ProvisioningLog{},
		&RegisteredDomain{},
		&DNSRecord{},
		&DunningSetting{},
		&DunningLog{},
	)
}
