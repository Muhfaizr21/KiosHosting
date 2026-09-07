package models

import (
	"time"
)

type TicketDepartment string

const (
	DeptTechnical TicketDepartment = "Technical"
	DeptBilling   TicketDepartment = "Billing"
	DeptSales     TicketDepartment = "Sales"
	DeptDomain    TicketDepartment = "Domain"
)

type TicketPriority string

const (
	PriorityLow    TicketPriority = "Low"
	PriorityMedium TicketPriority = "Medium"
	PriorityHigh   TicketPriority = "High"
	PriorityUrgent TicketPriority = "Urgent"
)

type TicketStatus string

const (
	TicketStatusOpen       TicketStatus = "Open"
	TicketStatusAnswered   TicketStatus = "Answered"
	TicketStatusInProgress TicketStatus = "In Progress"
	TicketStatusClosed     TicketStatus = "Closed"
)

type Ticket struct {
	ID         uint             `gorm:"primaryKey" json:"id"`
	Code       string           `gorm:"type:varchar(30);uniqueIndex;not null" json:"code"`
	UserID     uint             `gorm:"not null;index" json:"user_id"`
	User       User             `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Subject    string           `gorm:"type:varchar(255);not null" json:"subject"`
	Department TicketDepartment `gorm:"type:varchar(50);default:'Technical'" json:"department"`
	Priority   TicketPriority   `gorm:"type:varchar(30);default:'Medium'" json:"priority"`
	Status     TicketStatus     `gorm:"type:varchar(30);default:'Open'" json:"status"`
	Message    string           `gorm:"type:text;not null" json:"message"`
	Replies    []TicketReply    `gorm:"foreignKey:TicketID;constraint:OnDelete:CASCADE" json:"replies,omitempty"`
	ReplyCount int              `gorm:"-" json:"reply_count"`
	CreatedAt  time.Time        `json:"created_at"`
	UpdatedAt  time.Time        `json:"updated_at"`
}

type TicketReply struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TicketID  uint      `gorm:"not null;index" json:"ticket_id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	IsAdmin   bool      `gorm:"default:false" json:"is_admin"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Ticket) TableName() string {
	return "tickets"
}

func (TicketReply) TableName() string {
	return "ticket_replies"
}
