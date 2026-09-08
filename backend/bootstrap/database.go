package bootstrap

import (
	"fmt"
	"log"
	"time"

	"kioshosting-backend/app/models"
	"kioshosting-backend/config"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var DB *gorm.DB

func ConnectDatabase() {
	host := config.GetEnv("DB_HOST", "127.0.0.1")
	port := config.GetEnv("DB_PORT", "5432")
	user := config.GetEnv("DB_USER", "postgres")
	password := config.GetEnv("DB_PASSWORD", "")
	dbname := config.GetEnv("DB_NAME", "kioshosting")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	fmt.Println("🚀 Database connected successfully")
}

func Migrate() {
	if err := models.AutoMigrate(DB); err != nil {
		log.Fatalf("❌ Failed to migrate database: %v", err)
	}
	fmt.Println("🚀 Database migrated successfully")
}

func SeedDemoAccounts() {
	var count int64
	DB.Model(&models.User{}).Where("email IN (?)", []string{"admin@kioshosting.id", "budi@gmail.com"}).Count(&count)
	if count >= 2 {
		log.Println("ℹ️  Demo accounts already exist")
		return
	}

	adminRaw, hashErr := bcrypt.GenerateFromPassword([]byte(config.GetEnv("SEED_ADMIN_PASSWORD", "Admin123!@#_change_me")), bcrypt.DefaultCost)
	if hashErr != nil {
		log.Fatalf("❌ Failed to hash admin password: %v", hashErr)
	}
	adminHash := string(adminRaw)
	DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "email"}},
		DoUpdates: clause.Assignments(map[string]any{"password": adminHash, "role": models.RoleSuperadmin, "status": models.StatusActive}),
	}).Create(&models.User{Name: "Admin Utama", Email: "admin@kioshosting.id", Password: adminHash, Role: models.RoleSuperadmin, Status: models.StatusActive})

	userRaw, hashErr := bcrypt.GenerateFromPassword([]byte(config.GetEnv("SEED_USER_PASSWORD", "User1234!@#_change_me")), bcrypt.DefaultCost)
	if hashErr != nil {
		log.Fatalf("❌ Failed to hash user password: %v", hashErr)
	}
	userHash := string(userRaw)
	DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "email"}},
		DoUpdates: clause.Assignments(map[string]any{"password": userHash, "role": models.RoleUser, "status": models.StatusActive}),
	}).Create(&models.User{Name: "Budi Santoso", Email: "budi@gmail.com", Password: userHash, Role: models.RoleUser, Status: models.StatusActive})

	log.Println("ℹ️  Demo accounts seeded")
}

func SeedHostingInfrastructure() {
	// 1. Seed Server Connectors
	var serverCount int64
	DB.Model(&models.ServerConnector{}).Count(&serverCount)
	now := time.Now()
	if serverCount == 0 {
		servers := []models.ServerConnector{
			{
				Name:           "WHM-Cyber1-JKT (NVMe Cluster)",
				Type:           models.ServerTypeWHM,
				Host:           "whm01.kioshosting.id",
				IP:             "103.189.234.10",
				Port:           2087,
				APIToken:       config.GetEnv("WHM_API_TOKEN", "whm_tok_dev_change_me"),
				UseSSL:         true,
				MaxAccounts:    300,
				ActiveAccounts: 48,
				Status:         models.ServerStatusConnected,
				Nameserver1:    "ns1.kioshosting.id",
				Nameserver2:    "ns2.kioshosting.id",
				LastTestedAt:   &now,
				CreatedAt:      now,
				UpdatedAt:      now,
			},
			{
				Name:           "Proxmox-Node-Alpha (IDC 3D Jakarta)",
				Type:           models.ServerTypeProxmox,
				Host:           "pve01.kioshosting.id",
				IP:             "103.189.234.25",
				Port:           8006,
				APIToken:       config.GetEnv("PROXMOX_API_TOKEN", "pve_dev_change_me"),
				UseSSL:         true,
				MaxAccounts:    64,
				ActiveAccounts: 18,
				Status:         models.ServerStatusConnected,
				Nameserver1:    "ns1.kioshosting.id",
				Nameserver2:    "ns2.kioshosting.id",
				LastTestedAt:   &now,
				CreatedAt:      now,
				UpdatedAt:      now,
			},
			{
				Name:           "CyberPanel-SG1 (LiteSpeed High-Freq)",
				Type:           models.ServerTypeCyberPanel,
				Host:           "cp01.sg.kioshosting.id",
				IP:             "139.180.128.45",
				Port:           8090,
				APIToken:       config.GetEnv("CYBERPANEL_API_TOKEN", "cyber_dev_change_me"),
				UseSSL:         true,
				MaxAccounts:    150,
				ActiveAccounts: 32,
				Status:         models.ServerStatusConnected,
				Nameserver1:    "ns3.kioshosting.id",
				Nameserver2:    "ns4.kioshosting.id",
				LastTestedAt:   &now,
				CreatedAt:      now,
				UpdatedAt:      now,
			},
		}
		for _, s := range servers {
			DB.Create(&s)
		}
		log.Println("ℹ️  Server connectors seeded")
	}

	// 2. Ensure at least 1 Hosting Plan exists
	var plan models.HostingPlan
	if err := DB.First(&plan).Error; err != nil {
		plan = models.HostingPlan{
			Name:         "Cloud Business NVMe",
			Price:        149000,
			BillingCycle: "monthly",
			Disk:         "15 GB NVMe",
			CPU:          "2 Core",
			RAM:          "2 GB",
			Bandwidth:    "Unlimited",
			Status:       "Active",
			Target:       "Toko Online & Perusahaan",
			Features:     "Free SSL, LiteSpeed Cache, cPanel Panel, Daily Backup",
			IsFeatured:   true,
			YearlyPrice:  1490000,
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		DB.Create(&plan)
	}

	// 3. Seed User Services
	var serviceCount int64
	DB.Model(&models.UserService{}).Count(&serviceCount)
	var defaultUser models.User
	DB.Where("role = ?", models.RoleUser).First(&defaultUser)
	var firstServer models.ServerConnector
	DB.First(&firstServer)

	if serviceCount == 0 && defaultUser.ID > 0 && firstServer.ID > 0 {
		services := []models.UserService{
			{
				UserID:            defaultUser.ID,
				PlanID:            plan.ID,
				ServerConnectorID: firstServer.ID,
				Domain:            "tokoberkahmandiri.id",
				Username:          "tokoberkah",
				PasswordHash:      "KiosPass@991823!",
				IPAddress:         firstServer.IP,
				Status:            models.ServiceStatusActive,
				DiskLimitMB:       15360,
				DiskUsageMB:       4120,
				BandwidthLimitMB:  153600,
				BandwidthUsageMB:  28900,
				BillingCycle:      "monthly",
				NextDueDate:       now.AddDate(0, 0, 18),
				CreatedAt:         now.AddDate(0, -2, 0),
				UpdatedAt:         now,
			},
			{
				UserID:            defaultUser.ID,
				PlanID:            plan.ID,
				ServerConnectorID: firstServer.ID,
				Domain:            "solusidigitalindonesia.com",
				Username:          "solusidig",
				PasswordHash:      "KiosPass@771239!",
				IPAddress:         firstServer.IP,
				Status:            models.ServiceStatusActive,
				DiskLimitMB:       15360,
				DiskUsageMB:       6840,
				BandwidthLimitMB:  153600,
				BandwidthUsageMB:  51200,
				BillingCycle:      "monthly",
				NextDueDate:       now.AddDate(0, 0, 4), // due soon
				CreatedAt:         now.AddDate(0, -5, 0),
				UpdatedAt:         now,
			},
			{
				UserID:            defaultUser.ID,
				PlanID:            plan.ID,
				ServerConnectorID: firstServer.ID,
				Domain:            "bengkelkreatif.xyz",
				Username:          "bengkelkr",
				PasswordHash:      "KiosPass@331290!",
				IPAddress:         firstServer.IP,
				Status:            models.ServiceStatusSuspended,
				DiskLimitMB:       5120,
				DiskUsageMB:       1200,
				BandwidthLimitMB:  51200,
				BandwidthUsageMB:  3400,
				BillingCycle:      "monthly",
				NextDueDate:       now.AddDate(0, 0, -6),
				SuspendReason:     "Tunggakan Invoice Perpanjangan (H+3 Dunning)",
				CreatedAt:         now.AddDate(0, -3, 0),
				UpdatedAt:         now,
			},
		}
		for _, svc := range services {
			DB.Create(&svc)
			// Add provisioning log
			DB.Create(&models.ProvisioningLog{
				UserServiceID:     svc.ID,
				ServerConnectorID: firstServer.ID,
				Action:            "CREATE_ACCOUNT",
				TargetDomain:      svc.Domain,
				Status:            "SUCCESS",
				Details:           fmt.Sprintf("Account created via Auto-Provisioning on %s for user %s", firstServer.Host, svc.Username),
				LatencyMs:         120,
				CreatedAt:         svc.CreatedAt,
			})
		}
		log.Println("ℹ️  User services seeded")
	}

	// 4. Seed Registered Domains & DNS
	var domainCount int64
	DB.Model(&models.RegisteredDomain{}).Count(&domainCount)
	if domainCount == 0 && defaultUser.ID > 0 {
		domains := []models.RegisteredDomain{
			{
				UserID:       defaultUser.ID,
				DomainName:   "tokoberkahmandiri.id",
				Registrar:    models.RegistrarPANDI,
				EPPCode:      "EPP-ID8829#24!",
				IsLocked:     true,
				WhoisPrivacy: true,
				AutoRenew:    true,
				Status:       models.DomainStatusActive,
				RegisteredAt: now.AddDate(-1, 0, 0),
				ExpiresAt:    now.AddDate(0, 10, 15),
				NS1:          "ns1.kioshosting.id",
				NS2:          "ns2.kioshosting.id",
				CreatedAt:    now.AddDate(-1, 0, 0),
				UpdatedAt:    now,
			},
			{
				UserID:       defaultUser.ID,
				DomainName:   "solusidigitalindonesia.com",
				Registrar:    models.RegistrarResellerClub,
				EPPCode:      "EPP-RC9941#24!",
				IsLocked:     true,
				WhoisPrivacy: true,
				AutoRenew:    false,
				Status:       models.DomainStatusActive,
				RegisteredAt: now.AddDate(0, -11, -10),
				ExpiresAt:    now.AddDate(0, 0, 20), // expiring in 20 days
				NS1:          "ns1.kioshosting.id",
				NS2:          "ns2.kioshosting.id",
				CreatedAt:    now.AddDate(0, -11, -10),
				UpdatedAt:    now,
			},
			{
				UserID:       defaultUser.ID,
				DomainName:   "startupnusantara.co.id",
				Registrar:    models.RegistrarPANDI,
				EPPCode:      "EPP-ID1104#24!",
				IsLocked:     false,
				WhoisPrivacy: false,
				AutoRenew:    true,
				Status:       models.DomainStatusActive,
				RegisteredAt: now.AddDate(0, -6, 0),
				ExpiresAt:    now.AddDate(0, 6, 0),
				NS1:          "ns1.kioshosting.id",
				NS2:          "ns2.kioshosting.id",
				CreatedAt:    now.AddDate(0, -6, 0),
				UpdatedAt:    now,
			},
		}

		for _, dom := range domains {
			DB.Create(&dom)
			// Seed Zone Records
			records := []models.DNSRecord{
				{RegisteredDomainID: dom.ID, Type: "A", Name: "@", Content: "103.189.234.10", TTL: 3600, CreatedAt: now, UpdatedAt: now},
				{RegisteredDomainID: dom.ID, Type: "CNAME", Name: "www", Content: dom.DomainName + ".", TTL: 3600, CreatedAt: now, UpdatedAt: now},
				{RegisteredDomainID: dom.ID, Type: "A", Name: "mail", Content: "103.189.234.10", TTL: 3600, CreatedAt: now, UpdatedAt: now},
				{RegisteredDomainID: dom.ID, Type: "MX", Name: "@", Content: "mail." + dom.DomainName + ".", TTL: 3600, Priority: 10, CreatedAt: now, UpdatedAt: now},
				{RegisteredDomainID: dom.ID, Type: "TXT", Name: "@", Content: "v=spf1 a mx ip4:103.189.234.10 ~all", TTL: 3600, CreatedAt: now, UpdatedAt: now},
			}
			for _, rec := range records {
				DB.Create(&rec)
			}
		}
		log.Println("ℹ️  Domains & DNS zones seeded")
	}

	// 5. Seed Dunning Default Settings & Log
	var dunningCount int64
	DB.Model(&models.DunningLog{}).Count(&dunningCount)
	if dunningCount == 0 {
		DB.Create(&models.DunningSetting{
			AutoInvoiceDays:   14,
			AutoSuspendDays:   3,
			AutoTerminateDays: 30,
			IsEnabled:         true,
			NotifyEmail:       true,
			UpdatedAt:         now,
		})
		DB.Create(&models.DunningLog{
			ExecutedAt:         now.Add(-2 * time.Hour),
			TriggeredBy:        "cron",
			InvoicesGenerated:  3,
			ServicesSuspended:  1,
			ServicesTerminated: 0,
			Summary:            "Selesai: 3 invoice perpanjangan dibuat (H-14), 1 akun di-suspend (H+3), 0 akun di-terminate (H+30)",
			Status:             "SUCCESS",
			DurationMs:         240,
		})
		log.Println("ℹ️  Dunning settings and initial log seeded")
	}
}

func SeedFinanceData() {
	var coaCount int64
	DB.Model(&models.AccountCOA{}).Count(&coaCount)

	if coaCount == 0 {
		initialCOAs := []models.AccountCOA{
			{Code: "1001", Name: "Kas Operasional (Petty Cash)", Category: "Asset", NormalBalance: "Debit", Balance: 15450000, Description: "Kas tunai operasional kantor"},
			{Code: "1002", Name: "Bank BCA Operasional (772-019-8821)", Category: "Asset", NormalBalance: "Debit", Balance: 218500000, Description: "Rekening utama penerimaan dan pengeluaran"},
			{Code: "1003", Name: "Bank Mandiri Bisnis (132-00-9988-11)", Category: "Asset", NormalBalance: "Debit", Balance: 92400000, Description: "Rekening cadangan & payroll karyawan"},
			{Code: "1004", Name: "Payment Gateway Escrow (Midtrans / Xendit)", Category: "Asset", NormalBalance: "Debit", Balance: 38650000, Description: "Saldo berjalan di payment gateway"},
			{Code: "1101", Name: "Piutang Usaha (Accounts Receivable)", Category: "Asset", NormalBalance: "Debit", Balance: 14200000, Description: "Tagihan invoice klien yang belum dibayar"},
			{Code: "1501", Name: "Aset Tetap Server Hardware & Rack DC", Category: "Asset", NormalBalance: "Debit", Balance: 145000000, Description: "Server rack, switch, dan hardware di Datacenter"},
			{Code: "2001", Name: "Hutang Usaha Datacenter Colocation", Category: "Liability", NormalBalance: "Credit", Balance: 24500000, Description: "Kewajiban sewa rack dan power DC"},
			{Code: "2002", Name: "Hutang Lisensi Software", Category: "Liability", NormalBalance: "Credit", Balance: 11800000, Description: "Tagihan lisensi cPanel, CloudLinux bulanan"},
			{Code: "2101", Name: "Pendapatan Diterima di Muka (Unearned Revenue)", Category: "Liability", NormalBalance: "Credit", Balance: 78500000, Description: "Langganan hosting tahunan yang belum diakui"},
			{Code: "3001", Name: "Modal Disetor Pemilik", Category: "Equity", NormalBalance: "Credit", Balance: 300000000, Description: "Modal awal pendirian perusahaan"},
			{Code: "3101", Name: "Laba Ditahan (Retained Earnings)", Category: "Equity", NormalBalance: "Credit", Balance: 110900000, Description: "Akumulasi laba bersih tahun-tahun sebelumnya"},
			{Code: "4001", Name: "Pendapatan Shared Web Hosting", Category: "Revenue", NormalBalance: "Credit", Balance: 145000000, Description: "Penjualan paket Starter, Business, Enterprise"},
			{Code: "4002", Name: "Pendapatan Cloud VPS & Compute", Category: "Revenue", NormalBalance: "Credit", Balance: 86500000, Description: "Penjualan server virtual private cloud"},
			{Code: "4003", Name: "Pendapatan Dedicated Server", Category: "Revenue", NormalBalance: "Credit", Balance: 52000000, Description: "Sewa server fisik dedicated"},
			{Code: "4004", Name: "Pendapatan Registrasi & Renew Domain", Category: "Revenue", NormalBalance: "Credit", Balance: 41200000, Description: "Penjualan domain TLD .com, .id, dll"},
			{Code: "5001", Name: "HPP Registrasi Domain Wholesale", Category: "COGS", NormalBalance: "Debit", Balance: 28500000, Description: "Biaya beli domain ke registry PANDI / ICANN"},
			{Code: "5002", Name: "HPP Bandwidth & IP Transit Tier-1", Category: "COGS", NormalBalance: "Debit", Balance: 34000000, Description: "Biaya bandwidth uplink 10Gbps ke IIX/OIXP"},
			{Code: "5003", Name: "Fee Payment Gateway & MDR Transaksi", Category: "COGS", NormalBalance: "Debit", Balance: 6200000, Description: "Potongan biaya transaksi QRIS & VA"},
			{Code: "6001", Name: "Beban Sewa Rack & Power Colocation Datacenter", Category: "Expense", NormalBalance: "Debit", Balance: 48500000, Description: "Sewa rack Cyber 1 Jakarta & Equinix SG"},
			{Code: "6002", Name: "Beban Lisensi Server (cPanel, CloudLinux, LiteSpeed)", Category: "Expense", NormalBalance: "Debit", Balance: 29400000, Description: "Lisensi control panel dan security"},
			{Code: "6003", Name: "Beban Gaji SysAdmin, Support & Engineer", Category: "Expense", NormalBalance: "Debit", Balance: 56000000, Description: "Gaji pokok & tunjangan tim teknis"},
			{Code: "6004", Name: "Beban Pemasaran & Google/Meta Ads", Category: "Expense", NormalBalance: "Debit", Balance: 18500000, Description: "Iklan digital marketing dan promosi"},
			{Code: "6005", Name: "Beban Operasional Kantor & Legalitas", Category: "Expense", NormalBalance: "Debit", Balance: 9800000, Description: "Utilitas kantor, internet, dan perizinan"},
		}

		for _, coa := range initialCOAs {
			DB.Create(&coa)
		}
	}

	var trxCount int64
	DB.Model(&models.CashflowTransaction{}).Count(&trxCount)

	if trxCount == 0 {
		var bca models.AccountCOA
		DB.Where("code = ?", "1002").First(&bca)
		bcaID := bca.ID
		if bcaID == 0 {
			bcaID = 2
		}

		now := time.Now()
		monthsData := []struct {
			MonthOffset int
			Inflow      float64
			Outflow     float64
			InDesc      string
			OutDesc     string
		}{
			{MonthOffset: 5, Inflow: 41500000, Outflow: 21800000, InDesc: "Penerimaan langganan hosting & domain April 2026", OutDesc: "Sewa Datacenter & Lisensi cPanel April 2026"},
			{MonthOffset: 4, Inflow: 46200000, Outflow: 23100000, InDesc: "Penerimaan paket VPS & Dedicated Server Mei 2026", OutDesc: "Biaya IP Transit & Colocation Rack Mei 2026"},
			{MonthOffset: 3, Inflow: 51800000, Outflow: 24900000, InDesc: "Penerimaan invoice perpanjangan tahunan Juni 2026", OutDesc: "Pembaharuan Lisensi CloudLinux & LiteSpeed Juni 2026"},
			{MonthOffset: 2, Inflow: 58400000, Outflow: 27500000, InDesc: "Penerimaan order shared hosting promo Juli 2026", OutDesc: "Pembayaran Datacenter Cyber 1 & Gaji Support Juli 2026"},
			{MonthOffset: 1, Inflow: 64200000, Outflow: 29800000, InDesc: "Penerimaan invoice Enterprise Cloud Agustus 2026", OutDesc: "Upgrade Bandwidth 10G & Lisensi Server Agustus 2026"},
			{MonthOffset: 0, Inflow: 62700000, Outflow: 28400000, InDesc: "Penerimaan billing September 2026 berjalan", OutDesc: "Operasional Colocation & Lisensi September 2026"},
		}

		for idx, m := range monthsData {
			trxDate := now.AddDate(0, -m.MonthOffset, 0)
			DB.Create(&models.CashflowTransaction{
				RefNo:           fmt.Sprintf("TRX-%s-%04d", trxDate.Format("200601"), (idx*2)+1),
				Type:            "IN",
				AccountID:       bcaID,
				CategoryAccount: "Pendapatan Shared Web Hosting",
				Amount:          m.Inflow,
				TransactionDate: trxDate.Add(5 * time.Hour),
				Category:        "Hosting Revenue",
				Description:     m.InDesc,
				PaymentMethod:   "Bank Transfer BCA",
				ReferenceDoc:    fmt.Sprintf("INV-RECAP-%s", trxDate.Format("200601")),
				CreatedBy:       "Sistem Billing Otomatis",
			})
			DB.Create(&models.CashflowTransaction{
				RefNo:           fmt.Sprintf("TRX-%s-%04d", trxDate.Format("200601"), (idx*2)+2),
				Type:            "OUT",
				AccountID:       bcaID,
				CategoryAccount: "Beban Sewa Rack & Power Colocation Datacenter",
				Amount:          m.Outflow,
				TransactionDate: trxDate.Add(15 * time.Hour),
				Category:        "Server Colocation",
				Description:     m.OutDesc,
				PaymentMethod:   "Bank Transfer BCA",
				ReferenceDoc:    fmt.Sprintf("PO-DC-%s", trxDate.Format("200601")),
				CreatedBy:       "Finance Controller",
			})
		}
		log.Println("ℹ️  Finance initial data seeded")
	}
}

func SeedSecurityData() {
	var ipCount int64
	DB.Model(&models.BlockedIP{}).Count(&ipCount)
	now := time.Now()
	if ipCount == 0 {
		initialIPs := []models.BlockedIP{
			{IP: "185.220.101.5", Reason: "SSH Brute Force Attack (Port 22)", Source: "Fail2ban WAF", Node: "WHM-Cyber1-JKT", Status: "Active", CreatedAt: now.Add(-3 * time.Hour), UpdatedAt: now.Add(-3 * time.Hour)},
			{IP: "45.154.255.89", Reason: "WordPress wp-login.php Flood (120 req/s)", Source: "Cloudflare WAF", Node: "Global Edge", Status: "Active", CreatedAt: now.Add(-6 * time.Hour), UpdatedAt: now.Add(-6 * time.Hour)},
			{IP: "194.26.29.112", Reason: "SQL Injection Probe (URI /api/v1/checkout)", Source: "ModSecurity Core", Node: "WHM-Cyber1-JKT", Status: "Active", CreatedAt: now.Add(-12 * time.Hour), UpdatedAt: now.Add(-12 * time.Hour)},
			{IP: "103.145.12.90", Reason: "SMTP Relay Spam Abuse Probe", Source: "CSF Firewall", Node: "CyberPanel-SG1", Status: "Active", CreatedAt: now.Add(-24 * time.Hour), UpdatedAt: now.Add(-24 * time.Hour)},
			{IP: "89.248.165.74", Reason: "Port Scanning & Fingerprinting", Source: "Proxmox Firewall", Node: "Proxmox-Node-Alpha", Status: "Active", CreatedAt: now.Add(-48 * time.Hour), UpdatedAt: now.Add(-48 * time.Hour)},
		}
		for _, item := range initialIPs {
			DB.Create(&item)
		}
	}

	var settingCount int64
	DB.Model(&models.SecuritySetting{}).Count(&settingCount)
	if settingCount == 0 {
		defaultSettings := []models.SecuritySetting{
			{Key: "under_attack_mode", Value: "false"},
			{Key: "cf_status", Value: "Operational"},
			{Key: "cf_cache_cleared_at", Value: "Never"},
			{Key: "waf_mode", Value: "High (Aggressive Rate-Limit)"},
		}
		for _, s := range defaultSettings {
			DB.Create(&s)
		}
		log.Println("ℹ️  Security initial data seeded")
	}
}

func SeedSettingsData() {
	var configCount int64
	DB.Model(&models.SystemConfig{}).Count(&configCount)
	if configCount == 0 {
		defaultConfig := models.SystemConfig{
			CompanyName:         "KiosHosting.id",
			SupportEmail:        "support@kioshosting.id",
			CompanyPhone:        "+62 812-3456-7890",
			CompanyAddress:      "Cyber 1 Building, Lantai 5, Kuningan Barat, Jakarta Selatan 12710",
			DefaultCurrency:     "IDR (Rupiah)",
			AutoSuspendDays:     3,
			AutoTerminateDays:   30,
			MidtransEnvironment: "Sandbox",
			MidtransServerKey:   "SB-Mid-server-demo-kioshosting-key",
			MidtransClientKey:   "SB-Mid-client-demo-kioshosting-key",
			ResellerClubID:      "555432",
			ResellerClubAPIKey:  "rc-live-api-key-demo-kioshosting",
			UpdatedAt:           time.Now(),
		}
		DB.Create(&defaultConfig)
	}

	var webhookCount int64
	DB.Model(&models.Webhook{}).Count(&webhookCount)
	if webhookCount == 0 {
		DB.Create(&models.Webhook{
			Name:      "Discord Notification Channel",
			URL:       "https://discord.com/api/webhooks/123456789/kioshosting-alerts",
			Events:    "invoice.paid,client.registered,ticket.opened",
			SecretKey: "whsec_discord_production_demo",
			IsActive:  true,
		})
		log.Println("ℹ️  Settings initial data seeded")
	}
}

func SeedSupportTickets() {
	var ticketCount int64
	DB.Model(&models.Ticket{}).Count(&ticketCount)
	if ticketCount == 0 {
		var defaultUser models.User
		DB.Where("role = ?", models.RoleUser).First(&defaultUser)
		now := time.Now()
		if defaultUser.ID > 0 {
			t1 := models.Ticket{
				Code:       "#T-1001",
				UserID:     defaultUser.ID,
				Subject:    "Permintaan Bantuan Konfigurasi Cloudflare CDN & SSL Custom",
				Department: "Technical",
				Priority:   "High",
				Status:     models.TicketStatusOpen,
				Message:    "Halo Tim Support, saya memerlukan panduan untuk melakukan point NS domain saya ke Cloudflare namun tetap menggunakan Mail server internal KiosHosting. Mohon bantuannya.",
				ReplyCount: 0,
				CreatedAt:  now.Add(-3 * time.Hour),
				UpdatedAt:  now.Add(-3 * time.Hour),
			}
			DB.Create(&t1)
			log.Println("ℹ️  Support tickets initial data seeded")
		}
	}
}

