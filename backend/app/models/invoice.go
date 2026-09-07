package models

import (
	"time"
)

type InvoiceStatus string

const (
	InvoiceStatusPaid    InvoiceStatus = "Paid"
	InvoiceStatusUnpaid  InvoiceStatus = "Unpaid"
	InvoiceStatusOverdue InvoiceStatus = "Overdue"
)

type Invoice struct {
	ID        string        `gorm:"primaryKey;size:50" json:"id"`
	UserID    uint          `gorm:"not null" json:"user_id"`
	User      User          `gorm:"foreignKey:UserID" json:"client"`
	Amount    float64       `gorm:"not null" json:"amount"`
	Status    InvoiceStatus `gorm:"size:20;not null;default:'Unpaid'" json:"status"`
	DueDate   time.Time     `gorm:"not null" json:"due_date"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
}

func (Invoice) TableName() string {
	return "invoices"
}
