package models

import (
	"time"
)

// DunningSetting controls thresholds and auto-action behavior.
type DunningSetting struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	AutoInvoiceDays   int       `gorm:"default:14" json:"auto_invoice_days"`    // Generate invoice H-14
	AutoSuspendDays   int       `gorm:"default:3" json:"auto_suspend_days"`     // Freeze account H+3 overdue
	AutoTerminateDays int       `gorm:"default:30" json:"auto_terminate_days"`  // Destroy account H+30 overdue
	IsEnabled         bool      `gorm:"default:true" json:"is_enabled"`
	NotifyEmail       bool      `gorm:"default:true" json:"notify_email"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (DunningSetting) TableName() string {
	return "dunning_settings"
}

// DunningLog records execution runs of the automated billing lifecycle cron.
type DunningLog struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	ExecutedAt         time.Time `json:"executed_at"`
	TriggeredBy        string    `gorm:"size:50;default:'cron'" json:"triggered_by"` // cron, admin_manual
	InvoicesGenerated  int       `gorm:"default:0" json:"invoices_generated"`
	ServicesSuspended  int       `gorm:"default:0" json:"services_suspended"`
	ServicesTerminated int       `gorm:"default:0" json:"services_terminated"`
	Summary            string    `gorm:"type:text" json:"summary"`
	Status             string    `gorm:"size:30;default:'SUCCESS'" json:"status"` // SUCCESS, PARTIAL_ERROR
	DurationMs         int64     `json:"duration_ms"`
}

func (DunningLog) TableName() string {
	return "dunning_logs"
}
