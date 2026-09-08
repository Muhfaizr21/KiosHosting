package models

import (
	"time"
)

type ServerType string

const (
	ServerTypeCPanel     ServerType = "cpanel"
	ServerTypeWHM        ServerType = "whm"
	ServerTypeProxmox    ServerType = "proxmox"
	ServerTypeCyberPanel ServerType = "cyberpanel"
)

type ServerStatus string

const (
	ServerStatusConnected   ServerStatus = "connected"
	ServerStatusWarning     ServerStatus = "warning"
	ServerStatusUnreachable ServerStatus = "unreachable"
)

// ServerConnector represents a remote control panel or hypervisor instance.
type ServerConnector struct {
	ID             uint         `gorm:"primaryKey" json:"id"`
	Name           string       `gorm:"size:100;not null" json:"name"`
	Type           ServerType   `gorm:"size:30;not null;default:'whm'" json:"type"`
	Host           string       `gorm:"size:190;not null" json:"host"`
	IP             string       `gorm:"size:50;not null" json:"ip"`
	Port           int          `gorm:"not null;default:2087" json:"port"`
	APIToken       string       `gorm:"size:255;not null" json:"api_token"`
	UseSSL         bool         `gorm:"default:true" json:"use_ssl"`
	MaxAccounts    int          `gorm:"default:250" json:"max_accounts"`
	ActiveAccounts int          `gorm:"default:0" json:"active_accounts"`
	Status         ServerStatus `gorm:"size:30;default:'connected'" json:"status"`
	Nameserver1    string       `gorm:"size:100;default:'ns1.kioshosting.id'" json:"nameserver1"`
	Nameserver2    string       `gorm:"size:100;default:'ns2.kioshosting.id'" json:"nameserver2"`
	LastTestedAt   *time.Time   `json:"last_tested_at"`
	CreatedAt      time.Time    `json:"created_at"`
	UpdatedAt      time.Time    `json:"updated_at"`
}

func (ServerConnector) TableName() string {
	return "server_connectors"
}

type ServiceStatus string

const (
	ServiceStatusPending    ServiceStatus = "pending"
	ServiceStatusActive     ServiceStatus = "active"
	ServiceStatusSuspended  ServiceStatus = "suspended"
	ServiceStatusTerminated ServiceStatus = "terminated"
)

// UserService represents a client's allocated hosting or VPS instance.
type UserService struct {
	ID                uint            `gorm:"primaryKey" json:"id"`
	UserID            uint            `gorm:"not null;index" json:"user_id"`
	User              User            `gorm:"foreignKey:UserID" json:"client"`
	PlanID            uint            `gorm:"not null" json:"plan_id"`
	Plan              HostingPlan     `gorm:"foreignKey:PlanID" json:"plan"`
	ServerConnectorID uint            `gorm:"not null" json:"server_id"`
	ServerConnector   ServerConnector `gorm:"foreignKey:ServerConnectorID" json:"server"`
	Domain            string          `gorm:"size:190;not null;index" json:"domain"`
	Username          string          `gorm:"size:50;not null" json:"username"`
	PasswordHash      string          `gorm:"size:255" json:"password_hash"`
	IPAddress         string          `gorm:"size:50" json:"ip_address"`
	Status            ServiceStatus   `gorm:"size:30;not null;default:'pending'" json:"status"`
	DiskLimitMB       int             `gorm:"default:5120" json:"disk_limit_mb"` // 5 GB default
	DiskUsageMB       int             `gorm:"default:350" json:"disk_usage_mb"`
	BandwidthLimitMB  int             `gorm:"default:51200" json:"bw_limit_mb"` // 50 GB default
	BandwidthUsageMB  int             `gorm:"default:4200" json:"bw_usage_mb"`
	BillingCycle      string          `gorm:"size:20;default:'monthly'" json:"billing_cycle"`
	NextDueDate       time.Time       `json:"next_due_date"`
	SuspendedAt       *time.Time      `json:"suspended_at"`
	SuspendReason     string          `gorm:"size:255" json:"suspend_reason"`
	TerminatedAt      *time.Time      `json:"terminated_at"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
}

func (UserService) TableName() string {
	return "user_services"
}

// ProvisioningLog records each lifecycle action dispatched to the server panel.
type ProvisioningLog struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserServiceID   uint      `gorm:"index" json:"service_id"`
	ServerConnectorID uint    `gorm:"index" json:"server_id"`
	Action          string    `gorm:"size:50;not null" json:"action"` // CREATE_ACCOUNT, SUSPEND, UNSUSPEND, TERMINATE, SYNC
	TargetDomain    string    `gorm:"size:190;not null" json:"target_domain"`
	Status          string    `gorm:"size:30;not null" json:"status"` // SUCCESS, FAILED
	Details         string    `gorm:"type:text" json:"details"`
	LatencyMs       int64     `json:"latency_ms"`
	CreatedAt       time.Time `json:"created_at"`
}

func (ProvisioningLog) TableName() string {
	return "provisioning_logs"
}
