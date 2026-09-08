package models

import (
	"time"
)

// AccountCOA represents an account in the Chart of Accounts (Bagan Akun Standar)
type AccountCOA struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Code          string    `gorm:"size:20;uniqueIndex;not null" json:"code"` // e.g. 1001, 1002, 4001, 6001
	Name          string    `gorm:"size:120;not null" json:"name"`
	Category      string    `gorm:"size:50;not null" json:"category"` // Asset, Liability, Equity, Revenue, COGS, Expense
	NormalBalance string    `gorm:"size:10;not null;default:'Debit'" json:"normal_balance"` // Debit, Credit
	Balance       float64   `gorm:"default:0" json:"balance"`
	Description   string    `gorm:"size:255;default:''" json:"description"`
	IsActive      bool      `gorm:"default:true" json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (AccountCOA) TableName() string {
	return "account_coas"
}

// CashflowTransaction represents an operating cash inflow or outflow journal entry
type CashflowTransaction struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	RefNo           string     `gorm:"size:64;uniqueIndex;not null" json:"ref_no"` // e.g. TRX-202609-0001
	Type            string     `gorm:"size:10;not null" json:"type"`               // IN (Masuk), OUT (Keluar)
	AccountID       uint       `gorm:"not null" json:"account_id"`
	Account         AccountCOA `gorm:"foreignKey:AccountID" json:"account"`
	CategoryAccount string     `gorm:"size:120;default:''" json:"category_account"` // Opposite COA account name
	Amount          float64    `gorm:"not null" json:"amount"`
	TransactionDate time.Time  `gorm:"not null" json:"transaction_date"`
	Category        string     `gorm:"size:80;not null" json:"category"` // e.g. Hosting Revenue, Domain Wholesale, Colocation Server, Software License, etc.
	Description     string     `gorm:"size:255;not null" json:"description"`
	PaymentMethod   string     `gorm:"size:50;default:'Bank Transfer'" json:"payment_method"` // BCA, Mandiri, Midtrans QRIS, Xendit, Cash
	ReferenceDoc    string     `gorm:"size:100;default:''" json:"reference_doc"`              // Invoice ID, Receipt No, PO No
	CreatedBy       string     `gorm:"size:100;default:'System / Admin'" json:"created_by"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (CashflowTransaction) TableName() string {
	return "cashflow_transactions"
}
