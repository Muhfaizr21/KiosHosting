package models

import (
	"time"
)

type RegistrarType string

const (
	RegistrarPANDI        RegistrarType = "pandi"
	RegistrarResellerClub RegistrarType = "resellerclub"
	RegistrarNamecheap    RegistrarType = "namecheap"
)

type DomainStatus string

const (
	DomainStatusActive          DomainStatus = "Active"
	DomainStatusExpired         DomainStatus = "Expired"
	DomainStatusPendingTransfer DomainStatus = "Pending Transfer"
)

// RegisteredDomain represents an active or managed domain record.
type RegisteredDomain struct {
	ID           uint          `gorm:"primaryKey" json:"id"`
	UserID       uint          `gorm:"not null;index" json:"user_id"`
	User         User          `gorm:"foreignKey:UserID" json:"client"`
	DomainName   string        `gorm:"size:190;uniqueIndex;not null" json:"domain_name"`
	Registrar    RegistrarType `gorm:"size:40;not null;default:'resellerclub'" json:"registrar"`
	EPPCode      string        `gorm:"size:100" json:"epp_code"`
	IsLocked     bool          `gorm:"default:true" json:"is_locked"`
	WhoisPrivacy bool          `gorm:"default:true" json:"whois_privacy"`
	AutoRenew    bool          `gorm:"default:true" json:"auto_renew"`
	Status       DomainStatus  `gorm:"size:30;not null;default:'Active'" json:"status"`
	RegisteredAt time.Time     `json:"registered_at"`
	ExpiresAt    time.Time     `json:"expires_at"`
	NS1          string        `gorm:"size:100;default:'ns1.kioshosting.id'" json:"ns1"`
	NS2          string        `gorm:"size:100;default:'ns2.kioshosting.id'" json:"ns2"`
	NS3          string        `gorm:"size:100" json:"ns3"`
	NS4          string        `gorm:"size:100" json:"ns4"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
	DNSRecords   []DNSRecord   `gorm:"foreignKey:RegisteredDomainID;constraint:OnDelete:CASCADE" json:"dns_records,omitempty"`
}

func (RegisteredDomain) TableName() string {
	return "registered_domains"
}

// DNSRecord represents an individual record within a domain zone file.
type DNSRecord struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	RegisteredDomainID uint      `gorm:"not null;index" json:"domain_id"`
	Type               string    `gorm:"size:10;not null" json:"type"` // A, AAAA, CNAME, MX, TXT, SRV, NS
	Name               string    `gorm:"size:190;not null" json:"name"` // host / prefix e.g. "@", "www", "mail"
	Content            string    `gorm:"size:255;not null" json:"content"` // target IP or canonical hostname
	TTL                int       `gorm:"default:3600" json:"ttl"`
	Priority           int       `gorm:"default:0" json:"priority"` // applicable for MX, SRV
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

func (DNSRecord) TableName() string {
	return "dns_records"
}
