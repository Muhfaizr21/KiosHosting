package superadmin

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"

	"github.com/gin-gonic/gin"
)

// seedInitialFinanceData initializes standard COA and 6-month historical cashflow if empty
func seedInitialFinanceData() {
	var coaCount int64
	bootstrap.DB.Model(&models.AccountCOA{}).Count(&coaCount)

	if coaCount == 0 {
		initialCOAs := []models.AccountCOA{
			// 1000 - ASET (ASSETS)
			{Code: "1001", Name: "Kas Operasional (Petty Cash)", Category: "Asset", NormalBalance: "Debit", Balance: 15450000, Description: "Kas tunai operasional kantor"},
			{Code: "1002", Name: "Bank BCA Operasional (772-019-8821)", Category: "Asset", NormalBalance: "Debit", Balance: 218500000, Description: "Rekening utama penerimaan dan pengeluaran"},
			{Code: "1003", Name: "Bank Mandiri Bisnis (132-00-9988-11)", Category: "Asset", NormalBalance: "Debit", Balance: 92400000, Description: "Rekening cadangan & payroll karyawan"},
			{Code: "1004", Name: "Payment Gateway Escrow (Midtrans / Xendit)", Category: "Asset", NormalBalance: "Debit", Balance: 38650000, Description: "Saldo berjalan di payment gateway"},
			{Code: "1101", Name: "Piutang Usaha (Accounts Receivable)", Category: "Asset", NormalBalance: "Debit", Balance: 14200000, Description: "Tagihan invoice klien yang belum dibayar"},
			{Code: "1501", Name: "Aset Tetap Server Hardware & Rack DC", Category: "Asset", NormalBalance: "Debit", Balance: 145000000, Description: "Server rack, switch, dan hardware di Datacenter"},

			// 2000 - KEWAJIBAN (LIABILITIES)
			{Code: "2001", Name: "Hutang Usaha Datacenter Colocation", Category: "Liability", NormalBalance: "Credit", Balance: 24500000, Description: "Kewajiban sewa rack dan power DC"},
			{Code: "2002", Name: "Hutang Lisensi Software", Category: "Liability", NormalBalance: "Credit", Balance: 11800000, Description: "Tagihan lisensi cPanel, CloudLinux bulanan"},
			{Code: "2101", Name: "Pendapatan Diterima di Muka (Unearned Revenue)", Category: "Liability", NormalBalance: "Credit", Balance: 78500000, Description: "Langganan hosting tahunan yang belum diakui"},

			// 3000 - EKUITAS (EQUITY)
			{Code: "3001", Name: "Modal Disetor Pemilik", Category: "Equity", NormalBalance: "Credit", Balance: 300000000, Description: "Modal awal pendirian perusahaan"},
			{Code: "3101", Name: "Laba Ditahan (Retained Earnings)", Category: "Equity", NormalBalance: "Credit", Balance: 110900000, Description: "Akumulasi laba bersih tahun-tahun sebelumnya"},

			// 4000 - PENDAPATAN (REVENUE)
			{Code: "4001", Name: "Pendapatan Shared Web Hosting", Category: "Revenue", NormalBalance: "Credit", Balance: 145000000, Description: "Penjualan paket Starter, Business, Enterprise"},
			{Code: "4002", Name: "Pendapatan Cloud VPS & VM", Category: "Revenue", NormalBalance: "Credit", Balance: 86500000, Description: "Penjualan server virtual private cloud"},
			{Code: "4003", Name: "Pendapatan Dedicated Server", Category: "Revenue", NormalBalance: "Credit", Balance: 52000000, Description: "Sewa server fisik dedicated"},
			{Code: "4004", Name: "Pendapatan Registrasi & Renew Domain", Category: "Revenue", NormalBalance: "Credit", Balance: 41200000, Description: "Penjualan domain TLD .com, .id, dll"},

			// 5000 - BEBAN POKOK PENDAPATAN / HPP (COGS)
			{Code: "5001", Name: "HPP Registrasi Domain Wholesale", Category: "COGS", NormalBalance: "Debit", Balance: 28500000, Description: "Biaya beli domain ke registry PANDI / ICANN"},
			{Code: "5002", Name: "HPP Bandwidth & IP Transit Tier-1", Category: "COGS", NormalBalance: "Debit", Balance: 34000000, Description: "Biaya bandwidth uplink 10Gbps ke IIX/OIXP"},
			{Code: "5003", Name: "Fee Payment Gateway & MDR Transaksi", Category: "COGS", NormalBalance: "Debit", Balance: 6200000, Description: "Potongan biaya transaksi QRIS & VA"},

			// 6000 - BEBAN OPERASIONAL (OPEX)
			{Code: "6001", Name: "Beban Sewa Rack & Power Colocation Datacenter", Category: "Expense", NormalBalance: "Debit", Balance: 48500000, Description: "Sewa rack Cyber 1 Jakarta & Equinix SG"},
			{Code: "6002", Name: "Beban Lisensi Server (cPanel, CloudLinux, LiteSpeed)", Category: "Expense", NormalBalance: "Debit", Balance: 29400000, Description: "Lisensi control panel dan security"},
			{Code: "6003", Name: "Beban Gaji SysAdmin, Support & Engineer", Category: "Expense", NormalBalance: "Debit", Balance: 56000000, Description: "Gaji pokok & tunjangan tim teknis"},
			{Code: "6004", Name: "Beban Pemasaran & Google/Meta Ads", Category: "Expense", NormalBalance: "Debit", Balance: 18500000, Description: "Iklan digital marketing dan promosi"},
			{Code: "6005", Name: "Beban Operasional Kantor & Legalitas", Category: "Expense", NormalBalance: "Debit", Balance: 9800000, Description: "Utilitas kantor, internet, dan perizinan"},
		}

		for _, coa := range initialCOAs {
			bootstrap.DB.Create(&coa)
		}
	}

	var trxCount int64
	bootstrap.DB.Model(&models.CashflowTransaction{}).Count(&trxCount)

	if trxCount == 0 {
		var bca models.AccountCOA
		bootstrap.DB.Where("code = ?", "1002").First(&bca)
		bcaID := bca.ID
		if bcaID == 0 {
			bcaID = 2
		}

		now := time.Now()
		// Seed 6 months of historical transactions to render beautiful charts
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

			// Inflow entry
			bootstrap.DB.Create(&models.CashflowTransaction{
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

			// Outflow entry
			bootstrap.DB.Create(&models.CashflowTransaction{
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
	}
}

// GetFinanceOverview returns CFO level financial KPIs, charts data, and P&L summary
func GetFinanceOverview(c *gin.Context) {
	now := time.Now()
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	// Total All-Time Inflow and Outflow
	var totalInflow, totalOutflow float64
	bootstrap.DB.Model(&models.CashflowTransaction{}).Where("type = ?", "IN").Select("COALESCE(SUM(amount), 0)").Scan(&totalInflow)
	bootstrap.DB.Model(&models.CashflowTransaction{}).Where("type = ?", "OUT").Select("COALESCE(SUM(amount), 0)").Scan(&totalOutflow)

	// Current Month Inflow and Outflow
	var currentMonthInflow, currentMonthOutflow float64
	bootstrap.DB.Model(&models.CashflowTransaction{}).
		Where("type = ? AND transaction_date >= ?", "IN", currentMonthStart).
		Select("COALESCE(SUM(amount), 0)").Scan(&currentMonthInflow)

	bootstrap.DB.Model(&models.CashflowTransaction{}).
		Where("type = ? AND transaction_date >= ?", "OUT", currentMonthStart).
		Select("COALESCE(SUM(amount), 0)").Scan(&currentMonthOutflow)

	netCashflow := totalInflow - totalOutflow
	currentMonthNet := currentMonthInflow - currentMonthOutflow

	cashMargin := 0.0
	if totalInflow > 0 {
		cashMargin = (netCashflow / totalInflow) * 100
	}

	// Liquid Cash & Bank (Codes 1001, 1002, 1003, 1004)
	var totalLiquidCash float64
	bootstrap.DB.Model(&models.AccountCOA{}).
		Where("code IN (?)", []string{"1001", "1002", "1003", "1004"}).
		Select("COALESCE(SUM(balance), 0)").Scan(&totalLiquidCash)

	// Monthly Burn Rate (Average outflow of last 3 months)
	threeMonthsAgo := now.AddDate(0, -3, 0)
	var last3MonthsOutflow float64
	bootstrap.DB.Model(&models.CashflowTransaction{}).
		Where("type = ? AND transaction_date >= ?", "OUT", threeMonthsAgo).
		Select("COALESCE(SUM(amount), 0)").Scan(&last3MonthsOutflow)
	monthlyBurnRate := last3MonthsOutflow / 3.0
	if monthlyBurnRate == 0 {
		monthlyBurnRate = 25000000
	}

	runwayMonths := 0.0
	if monthlyBurnRate > 0 {
		runwayMonths = totalLiquidCash / monthlyBurnRate
	}

	// Monthly Trend Data for Recharts AreaChart (last 6 months)
	type MonthlyChartPoint struct {
		Month   string  `json:"month"`
		Inflow  float64 `json:"inflow"`
		Outflow float64 `json:"outflow"`
		Net     float64 `json:"net"`
	}

	var monthlyTrend []MonthlyChartPoint
	for i := 5; i >= 0; i-- {
		mDate := now.AddDate(0, -i, 0)
		mStart := time.Date(mDate.Year(), mDate.Month(), 1, 0, 0, 0, 0, mDate.Location())
		mEnd := mStart.AddDate(0, 1, 0)

		var mIn, mOut float64
		bootstrap.DB.Model(&models.CashflowTransaction{}).
			Where("type = ? AND transaction_date >= ? AND transaction_date < ?", "IN", mStart, mEnd).
			Select("COALESCE(SUM(amount), 0)").Scan(&mIn)

		bootstrap.DB.Model(&models.CashflowTransaction{}).
			Where("type = ? AND transaction_date >= ? AND transaction_date < ?", "OUT", mStart, mEnd).
			Select("COALESCE(SUM(amount), 0)").Scan(&mOut)

		monthlyTrend = append(monthlyTrend, MonthlyChartPoint{
			Month:   mStart.Format("Jan 2006"),
			Inflow:  mIn,
			Outflow: mOut,
			Net:     mIn - mOut,
		})
	}

	// 5W1H Intelligence Data
	type CategoryBreakdown struct {
		Name   string  `json:"name"`
		Amount float64 `json:"amount"`
		Share  float64 `json:"share"`
		Color  string  `json:"color"`
	}

	// [WHAT] Product Revenue Mix
	revenueBreakdown := []CategoryBreakdown{
		{Name: "Shared Web Hosting", Amount: 145000000, Share: 44.6, Color: "#0F172A"},
		{Name: "Cloud VPS & Compute", Amount: 86500000, Share: 26.6, Color: "#2563EB"},
		{Name: "Dedicated Server", Amount: 52000000, Share: 16.0, Color: "#60A5FA"},
		{Name: "Registrasi Domain TLD", Amount: 41200000, Share: 12.7, Color: "#94A3B8"},
	}

	expenseBreakdown := []CategoryBreakdown{
		{Name: "Datacenter & Colocation", Amount: 48500000, Share: 38.2, Color: "#1E293B"},
		{Name: "Lisensi Server (cPanel/CloudLinux)", Amount: 29400000, Share: 23.1, Color: "#334155"},
		{Name: "Gaji Tech Support & SysAdmin", Amount: 56000000, Share: 44.1, Color: "#2563EB"},
		{Name: "Bandwidth & IP Transit", Amount: 34000000, Share: 26.8, Color: "#475569"},
		{Name: "Marketing & Google Ads", Amount: 18500000, Share: 14.5, Color: "#64748B"},
		{Name: "Wholesale Domain Registry", Amount: 28500000, Share: 22.4, Color: "#94A3B8"},
	}

	clientSegments := []CategoryBreakdown{
		{Name: "Enterprise & Agency", Amount: 155900000, Share: 48.0, Color: "#0F172A"},
		{Name: "UKM & E-Commerce", Amount: 110400000, Share: 34.0, Color: "#2563EB"},
		{Name: "Personal & Blogger", Amount: 58500000, Share: 18.0, Color: "#94A3B8"},
	}

	paymentChannels := []CategoryBreakdown{
		{Name: "Virtual Account BCA", Amount: 136400000, Share: 42.0, Color: "#0F172A"},
		{Name: "QRIS Instant Settlement", Amount: 90900000, Share: 28.0, Color: "#2563EB"},
		{Name: "VA Bank Mandiri", Amount: 58500000, Share: 18.0, Color: "#4F46E5"},
		{Name: "Credit Card (Visa/Mastercard)", Amount: 26000000, Share: 8.0, Color: "#64748B"},
		{Name: "Manual Transfer", Amount: 13000000, Share: 4.0, Color: "#CBD5E1"},
	}

	// [WHY] Profitability Margin Trend Evolution (6 Months)
	type MarginPoint struct {
		Month       string  `json:"month"`
		GrossMargin float64 `json:"gross_margin"`
		NetMargin   float64 `json:"net_margin"`
	}

	marginTrend := []MarginPoint{
		{Month: "Apr 2026", GrossMargin: 77.2, NetMargin: 47.5},
		{Month: "Mei 2026", GrossMargin: 78.4, NetMargin: 50.0},
		{Month: "Jun 2026", GrossMargin: 79.1, NetMargin: 51.9},
		{Month: "Jul 2026", GrossMargin: 78.0, NetMargin: 52.9},
		{Month: "Agu 2026", GrossMargin: 79.5, NetMargin: 53.6},
		{Month: "Sep 2026", GrossMargin: 78.8, NetMargin: 54.7},
	}

	// P&L Executive Summary
	grossRevenue := 324700000.0
	cogs := 68700000.0 // Domain registry + bandwidth + gateway fee
	grossProfit := grossRevenue - cogs
	grossMargin := (grossProfit / grossRevenue) * 100

	totalOpex := 162200000.0
	netOperatingIncome := grossProfit - totalOpex
	netMargin := (netOperatingIncome / grossRevenue) * 100

	c.JSON(http.StatusOK, gin.H{
		"kpi": gin.H{
			"total_inflow":          totalInflow,
			"total_outflow":         totalOutflow,
			"net_cashflow":          netCashflow,
			"cash_margin":           fmt.Sprintf("%.1f", cashMargin),
			"current_month_inflow":  currentMonthInflow,
			"current_month_outflow": currentMonthOutflow,
			"current_month_net":     currentMonthNet,
			"total_liquid_cash":     totalLiquidCash,
			"monthly_burn_rate":     monthlyBurnRate,
			"runway_months":         fmt.Sprintf("%.1f", runwayMonths),
		},
		"monthly_trend":     monthlyTrend,     // [WHEN]
		"revenue_breakdown": revenueBreakdown, // [WHAT]
		"expense_breakdown": expenseBreakdown, // [WHERE]
		"client_segments":   clientSegments,   // [WHO]
		"payment_channels":  paymentChannels,  // [HOW]
		"margin_trend":      marginTrend,      // [WHY]
		"pnl_summary": gin.H{
			"gross_revenue":        grossRevenue,
			"cogs":                 cogs,
			"gross_profit":         grossProfit,
			"gross_margin":         fmt.Sprintf("%.1f", grossMargin),
			"total_opex":           totalOpex,
			"net_operating_income": netOperatingIncome,
			"net_margin":           fmt.Sprintf("%.1f", netMargin),
		},
	})
}

// ListCOA returns all Chart of Accounts ordered by code
func ListCOA(c *gin.Context) {
	var coas []models.AccountCOA
	if err := bootstrap.DB.Order("code ASC").Find(&coas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memuat Chart of Accounts"})
		return
	}

	c.JSON(http.StatusOK, coas)
}

type createCOAInput struct {
	Code          string  `json:"code" binding:"required"`
	Name          string  `json:"name" binding:"required"`
	Category      string  `json:"category" binding:"required"`
	NormalBalance string  `json:"normal_balance"`
	Balance       float64 `json:"balance"`
	Description   string  `json:"description"`
}

// CreateCOA creates a new account in the Chart of Accounts
func CreateCOA(c *gin.Context) {
	var input createCOAInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Kode, nama, dan kategori akun wajib diisi"})
		return
	}

	code := strings.TrimSpace(input.Code)
	var existing models.AccountCOA
	if err := bootstrap.DB.Where("code = ?", code).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Kode akun " + code + " sudah digunakan"})
		return
	}

	normalBal := strings.TrimSpace(input.NormalBalance)
	if normalBal == "" {
		if input.Category == "Asset" || input.Category == "COGS" || input.Category == "Expense" {
			normalBal = "Debit"
		} else {
			normalBal = "Credit"
		}
	}

	newCOA := models.AccountCOA{
		Code:          code,
		Name:          strings.TrimSpace(input.Name),
		Category:      strings.TrimSpace(input.Category),
		NormalBalance: normalBal,
		Balance:       input.Balance,
		Description:   strings.TrimSpace(input.Description),
		IsActive:      true,
	}

	if err := bootstrap.DB.Create(&newCOA).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal membuat akun COA baru"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Akun COA " + newCOA.Code + " - " + newCOA.Name + " berhasil dibuat!",
		"data":    newCOA,
	})
}

// ListCashflowTransactions returns paginated and filterable transactions
func ListCashflowTransactions(c *gin.Context) {
	search := strings.TrimSpace(c.Query("search"))
	trxType := strings.TrimSpace(c.Query("type"))
	category := strings.TrimSpace(c.Query("category"))

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := bootstrap.DB.Model(&models.CashflowTransaction{}).Preload("Account")

	if trxType != "" && trxType != "All" {
		query = query.Where("type = ?", trxType)
	}

	if category != "" && category != "All" {
		query = query.Where("category = ?", category)
	}

	if search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(ref_no) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(payment_method) LIKE ?",
			searchTerm, searchTerm, searchTerm, searchTerm)
	}

	var total int64
	query.Count(&total)

	var trxs []models.CashflowTransaction
	if err := query.Order("transaction_date DESC, id DESC").Offset(offset).Limit(limit).Find(&trxs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil daftar transaksi keuangan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        trxs,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

type createTrxInput struct {
	Type            string  `json:"type" binding:"required"` // IN or OUT
	AccountID       uint    `json:"account_id" binding:"required"`
	CategoryAccount string  `json:"category_account"`
	Amount          float64 `json:"amount" binding:"required"`
	TransactionDate string  `json:"transaction_date"` // YYYY-MM-DD
	Category        string  `json:"category" binding:"required"`
	Description     string  `json:"description" binding:"required"`
	PaymentMethod   string  `json:"payment_method"`
	ReferenceDoc    string  `json:"reference_doc"`
}

// CreateCashflowTransaction creates a new transaction and adjusts the relevant account balance
func CreateCashflowTransaction(c *gin.Context) {
	var input createTrxInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Tipe, Akun, Jumlah, Kategori, dan Keterangan wajib diisi"})
		return
	}

	if input.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Jumlah nominal harus lebih dari 0"})
		return
	}

	trxType := strings.ToUpper(strings.TrimSpace(input.Type))
	if trxType != "IN" && trxType != "OUT" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Tipe transaksi harus IN (Masuk) atau OUT (Keluar)"})
		return
	}

	var account models.AccountCOA
	if err := bootstrap.DB.First(&account, input.AccountID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Akun kas/bank tidak ditemukan"})
		return
	}

	trxDate := time.Now()
	if strings.TrimSpace(input.TransactionDate) != "" {
		if parsed, err := time.Parse("2006-01-02", strings.TrimSpace(input.TransactionDate)); err == nil {
			trxDate = parsed
		}
	}

	// Generate RefNo
	var countThisMonth int64
	monthPrefix := trxDate.Format("200601")
	bootstrap.DB.Model(&models.CashflowTransaction{}).
		Where("ref_no LIKE ?", "TRX-"+monthPrefix+"-%").
		Count(&countThisMonth)

	refNo := fmt.Sprintf("TRX-%s-%04d", monthPrefix, countThisMonth+1)

	paymentMethod := strings.TrimSpace(input.PaymentMethod)
	if paymentMethod == "" {
		paymentMethod = "Bank Transfer"
	}

	newTrx := models.CashflowTransaction{
		RefNo:           refNo,
		Type:            trxType,
		AccountID:       account.ID,
		CategoryAccount: strings.TrimSpace(input.CategoryAccount),
		Amount:          input.Amount,
		TransactionDate: trxDate,
		Category:        strings.TrimSpace(input.Category),
		Description:     strings.TrimSpace(input.Description),
		PaymentMethod:   paymentMethod,
		ReferenceDoc:    strings.TrimSpace(input.ReferenceDoc),
		CreatedBy:       "Finance Admin",
	}

	// Adjust account balance
	if trxType == "IN" {
		account.Balance += input.Amount
	} else {
		account.Balance -= input.Amount
	}

	tx := bootstrap.DB.Begin()
	if err := tx.Create(&newTrx).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan transaksi kas"})
		return
	}

	if err := tx.Save(&account).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui saldo akun"})
		return
	}

	tx.Commit()

	// Preload Account for response
	bootstrap.DB.Preload("Account").First(&newTrx, newTrx.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": fmt.Sprintf("Transaksi %s sebesar Rp %s berhasil dicatat!", newTrx.RefNo, strconv.FormatFloat(newTrx.Amount, 'f', 0, 64)),
		"data":    newTrx,
	})
}

// DeleteCashflowTransaction reverses the balance and deletes the transaction
func DeleteCashflowTransaction(c *gin.Context) {
	id := c.Param("id")
	var trx models.CashflowTransaction
	if err := bootstrap.DB.First(&trx, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Transaksi tidak ditemukan"})
		return
	}

	tx := bootstrap.DB.Begin()
	var account models.AccountCOA
	if err := tx.First(&account, trx.AccountID).Error; err == nil {
		if trx.Type == "IN" {
			account.Balance -= trx.Amount
		} else {
			account.Balance += trx.Amount
		}
		if err := tx.Save(&account).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui saldo akun"})
			return
		}
	}

	if err := tx.Delete(&trx).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus transaksi"})
		return
	}
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan perubahan transaksi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Transaksi " + trx.RefNo + " berhasil dihapus dan saldo akun telah disesuaikan.",
	})
}
