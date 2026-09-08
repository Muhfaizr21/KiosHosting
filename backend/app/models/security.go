package models

import (
	"time"
)

// BlockedIP tracks IP addresses blocked by WAF, Fail2ban, or manual admin action.
type BlockedIP struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	IP        string    `gorm:"size:64;index;not null" json:"ip"`
	Reason    string    `gorm:"size:255;not null" json:"reason"`
	Source    string    `gorm:"size:50;not null;default:'Manual Admin'" json:"source"` // Fail2ban, ModSecurity, Cloudflare, Manual Admin
	Node      string    `gorm:"size:50;not null;default:'Global'" json:"node"`          // JKT-01, JKT-02, SGP-01, Global
	Status    string    `gorm:"size:20;not null;default:'Active'" json:"status"`        // Active, Unbanned
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (BlockedIP) TableName() string {
	return "blocked_ips"
}

// SecuritySetting stores key-value configuration for WAF and security features.
type SecuritySetting struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Key       string    `gorm:"size:100;uniqueIndex;not null" json:"key"`
	Value     string    `gorm:"type:text;not null" json:"value"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (SecuritySetting) TableName() string {
	return "security_settings"
}
