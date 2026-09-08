package models

import (
	"time"
)

type HostingPlan struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	Price         float64   `gorm:"not null" json:"price"`
	BillingCycle  string    `gorm:"size:20;not null;default:'monthly'" json:"cycle"` // monthly, yearly
	Disk          string    `gorm:"size:50;not null" json:"disk"`                    // e.g. 5 GB NVMe
	CPU           string    `gorm:"size:50;default:'1 Core'" json:"cpu"`
	RAM           string    `gorm:"size:50;default:'1 GB'" json:"ram"`
	Bandwidth     string    `gorm:"size:50;default:'Unlimited'" json:"bandwidth"`
	ActiveClients int       `gorm:"default:0" json:"clients"`
	Status        string    `gorm:"size:20;not null;default:'Active'" json:"status"` // Active, Inactive
	Target        string    `gorm:"size:100;default:''" json:"target"`               // e.g. Blogger & UMKM
	Features      string    `gorm:"type:text;default:''" json:"features"`             // comma/newline-separated features
	IsFeatured    bool      `gorm:"default:false" json:"featured"`                   // Popular badge
	YearlyPrice   float64   `gorm:"default:0" json:"yearly_price"`                   // Yearly discounted price
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (HostingPlan) TableName() string {
	return "hosting_plans"
}

type DomainTLD struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	TLD           string    `gorm:"size:30;uniqueIndex;not null" json:"tld"` // e.g. .com, .id
	RegisterPrice float64   `gorm:"not null" json:"register"`
	RenewPrice    float64   `gorm:"not null" json:"renew"`
	TransferPrice float64   `gorm:"not null" json:"transfer"`
	IsActive      bool      `gorm:"default:true" json:"active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (DomainTLD) TableName() string {
	return "domain_tlds"
}
