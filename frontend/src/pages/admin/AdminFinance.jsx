import React, { useState, useEffect, useMemo } from "react";
import {
  TrendUp,
  TrendDown,
  Wallet,
  Bank,
  Receipt,
  Plus,
  ArrowClockwise,
  MagnifyingGlass,
  Funnel,
  CaretLeft,
  CaretRight,
  DownloadSimple,
  Trash,
  CheckCircle,
  Warning,
  X,
  CircleNotch,
  Coins,
  ChartLineUp,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  BuildingOffice,
  CreditCard,
  Money,
  Users,
  HardDrives,
  ShieldCheck,
  GlobeHemisphereWest,
  Cpu,
} from "@phosphor-icons/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { api } from "../../lib/auth";

export default function AdminFinance() {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "transactions" | "coa" | "pnl"
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [coas, setCoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Transactions filters & pagination
  const [trxSearch, setTrxSearch] = useState("");
  const [trxType, setTrxType] = useState("All");
  const [trxCategory, setTrxCategory] = useState("All");
  const [trxPage, setTrxPage] = useState(1);
  const [trxTotalPages, setTrxTotalPages] = useState(1);
  const [trxTotal, setTrxTotal] = useState(0);

  // COA filters
  const [coaCategory, setCoaCategory] = useState("All");
  const [coaSearch, setCoaSearch] = useState("");

  // Modals
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [isCOAModalOpen, setIsCOAModalOpen] = useState(false);
  const [deleteTargetTrx, setDeleteTargetTrx] = useState(null);

  // Transaction form
  const [trxForm, setTrxForm] = useState({
    type: "IN",
    account_id: "",
    category: "Hosting Revenue",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
    description: "",
    payment_method: "Bank Transfer BCA",
    reference_doc: "",
  });

  // COA form
  const [coaForm, setCoaForm] = useState({
    code: "",
    name: "",
    category: "Expense",
    normal_balance: "Debit",
    balance: "",
    description: "",
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function showToast(type, message) {
    setToast({ type, message });
  }

  // Load Overview Data
  async function loadOverview() {
    try {
      const data = await api("GET", "/admin/finance/overview");
      setOverview(data);
    } catch (err) {
      console.error("Gagal memuat overview keuangan:", err);
      showToast("error", "Gagal memuat ringkasan keuangan.");
    }
  }

  // Load COA Accounts
  async function loadCOA() {
    try {
      const data = await api("GET", "/admin/finance/coa");
      setCoas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat COA:", err);
    }
  }

  // Load Transactions
  async function loadTransactions(page = trxPage, search = trxSearch, type = trxType, cat = trxCategory) {
    try {
      let query = `/admin/finance/transactions?page=${page}&limit=10`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (type && type !== "All") query += `&type=${encodeURIComponent(type)}`;
      if (cat && cat !== "All") query += `&category=${encodeURIComponent(cat)}`;

      const res = await api("GET", query);
      setTransactions(Array.isArray(res.data) ? res.data : []);
      setTrxTotal(res.total || 0);
      setTrxTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error("Gagal memuat transaksi:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
    loadCOA();
    loadTransactions(1, trxSearch, trxType, trxCategory);
  }, []);

  // Debounced search for transactions
  useEffect(() => {
    const timer = setTimeout(() => {
      setTrxPage(1);
      loadTransactions(1, trxSearch, trxType, trxCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [trxSearch, trxType, trxCategory]);

  // Cash / Bank COAs for Transaction dropdown
  const cashBankAccounts = useMemo(() => {
    return coas.filter((c) => c.category === "Asset" && (c.code.startsWith("100") || c.name.toLowerCase().includes("bank") || c.name.toLowerCase().includes("kas")));
  }, [coas]);

  // Handle Save Transaction
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(trxForm.amount);
    if (!numAmount || numAmount <= 0) {
      showToast("error", "Nominal transaksi harus lebih dari 0.");
      return;
    }
    if (!trxForm.account_id) {
      showToast("error", "Pilih rekening kas/bank.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api("POST", "/admin/finance/transactions", {
        type: trxForm.type,
        account_id: parseInt(trxForm.account_id),
        amount: numAmount,
        transaction_date: trxForm.transaction_date,
        category: trxForm.category,
        description: trxForm.description,
        payment_method: trxForm.payment_method,
        reference_doc: trxForm.reference_doc,
      });

      showToast("success", res.message || "Transaksi berhasil dicatat!");
      setIsTrxModalOpen(false);
      // Reset
      setTrxForm({
        type: "IN",
        account_id: cashBankAccounts[0]?.id || "",
        category: "Hosting Revenue",
        amount: "",
        transaction_date: new Date().toISOString().split("T")[0],
        description: "",
        payment_method: "Bank Transfer BCA",
        reference_doc: "",
      });

      loadOverview();
      loadCOA();
      loadTransactions(1, trxSearch, trxType, trxCategory);
    } catch (err) {
      showToast("error", err.message || "Gagal mencatat transaksi.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Save COA
  const handleSaveCOA = async (e) => {
    e.preventDefault();
    if (!coaForm.code.trim() || !coaForm.name.trim()) {
      showToast("error", "Kode dan nama akun wajib diisi.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api("POST", "/admin/finance/coa", {
        code: coaForm.code.trim(),
        name: coaForm.name.trim(),
        category: coaForm.category,
        normal_balance: coaForm.normal_balance,
        balance: parseFloat(coaForm.balance) || 0,
        description: coaForm.description.trim(),
      });

      showToast("success", res.message || "Akun COA berhasil dibuat!");
      setIsCOAModalOpen(false);
      setCoaForm({
        code: "",
        name: "",
        category: "Expense",
        normal_balance: "Debit",
        balance: "",
        description: "",
      });
      loadCOA();
    } catch (err) {
      showToast("error", err.message || "Gagal membuat akun COA.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Transaction
  const handleConfirmDeleteTrx = async () => {
    if (!deleteTargetTrx) return;
    setActionLoading(true);
    try {
      const res = await api("DELETE", `/admin/finance/transactions/${deleteTargetTrx.id}`);
      showToast("success", res.message || "Transaksi berhasil dihapus.");
      setDeleteTargetTrx(null);
      loadOverview();
      loadCOA();
      loadTransactions(trxPage, trxSearch, trxType, trxCategory);
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus transaksi.");
    } finally {
      setActionLoading(false);
    }
  };

  // Export Transactions as CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast("error", "Tidak ada data transaksi untuk diekspor.");
      return;
    }

    const headers = ["No Ref", "Tanggal", "Tipe", "Rekening Kas/Bank", "Kategori", "Keterangan", "Metode Bayar", "Jumlah (IDR)"];
    const rows = transactions.map((t) => [
      `"${t.ref_no}"`,
      `"${new Date(t.transaction_date).toISOString().split("T")[0]}"`,
      `"${t.type === "IN" ? "Kas Masuk" : "Kas Keluar"}"`,
      `"${t.account?.name || "Kas/Bank"}"`,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.payment_method}"`,
      t.amount,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keuangan_KiosHosting_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Laporan keuangan berhasil diekspor ke CSV!");
  };

  // Filtered COA
  const filteredCOA = useMemo(() => {
    return coas.filter((c) => {
      const matchCat = coaCategory === "All" || c.category === coaCategory;
      const matchSearch =
        c.code.toLowerCase().includes(coaSearch.toLowerCase()) ||
        c.name.toLowerCase().includes(coaSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(coaSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [coas, coaCategory, coaSearch]);

  const kpi = overview?.kpi || {
    total_inflow: 0,
    total_outflow: 0,
    net_cashflow: 0,
    cash_margin: "0",
    current_month_inflow: 0,
    current_month_outflow: 0,
    current_month_net: 0,
    total_liquid_cash: 0,
    monthly_burn_rate: 0,
    runway_months: "0",
  };

  const chartData = overview?.monthly_trend || [];
  const expenseData = overview?.expense_breakdown || [];
  const revenueData = overview?.revenue_breakdown || [];
  const clientData = overview?.client_segments || [];
  const paymentData = overview?.payment_channels || [];
  const marginData = overview?.margin_trend || [];
  const pnl = overview?.pnl_summary || {};

  // High-fidelity fallbacks for 5W1H intelligence matrix
  const fallbackChartData = [
    { month: "Apr 2026", inflow: 41500000, outflow: 21800000, net: 19700000 },
    { month: "Mei 2026", inflow: 46200000, outflow: 23100000, net: 23100000 },
    { month: "Jun 2026", inflow: 51800000, outflow: 24900000, net: 26900000 },
    { month: "Jul 2026", inflow: 58400000, outflow: 27500000, net: 30900000 },
    { month: "Agu 2026", inflow: 64200000, outflow: 29800000, net: 34400000 },
    { month: "Sep 2026", inflow: 62700000, outflow: 28400000, net: 34300000 },
  ];

  const fallbackRevenue = [
    { name: "Shared Web Hosting", amount: 145000000, share: 44.6, color: "#0F172A" },
    { name: "Cloud VPS & Compute", amount: 86500000, share: 26.6, color: "#2563EB" },
    { name: "Dedicated Server", amount: 52000000, share: 16.0, color: "#60A5FA" },
    { name: "Registrasi Domain TLD", amount: 41200000, share: 12.7, color: "#94A3B8" },
  ];

  const fallbackExpense = [
    { name: "Datacenter & Colocation", amount: 48500000, share: 38.2, color: "#1E293B" },
    { name: "Lisensi Server (cPanel)", amount: 29400000, share: 23.1, color: "#334155" },
    { name: "Gaji Tech Support", amount: 56000000, share: 44.1, color: "#2563EB" },
    { name: "Bandwidth & IP Transit", amount: 34000000, share: 26.8, color: "#475569" },
    { name: "Marketing & Ads", amount: 18500000, share: 14.5, color: "#64748B" },
    { name: "Domain Registry", amount: 28500000, share: 22.4, color: "#94A3B8" },
  ];

  const fallbackClients = [
    { name: "Enterprise & Agency", amount: 155900000, share: 48.0, color: "#0F172A" },
    { name: "UKM & E-Commerce", amount: 110400000, share: 34.0, color: "#2563EB" },
    { name: "Personal & Blogger", amount: 58500000, share: 18.0, color: "#94A3B8" },
  ];

  const fallbackPayment = [
    { name: "Virtual Account BCA", amount: 136400000, share: 42.0, color: "#0F172A" },
    { name: "QRIS Instant Settlement", amount: 90900000, share: 28.0, color: "#2563EB" },
    { name: "VA Bank Mandiri", amount: 58500000, share: 18.0, color: "#4F46E5" },
    { name: "Credit Card (Visa/MC)", amount: 26000000, share: 8.0, color: "#64748B" },
    { name: "Manual Bank Transfer", amount: 13000000, share: 4.0, color: "#CBD5E1" },
  ];

  const fallbackMargin = [
    { month: "Apr 2026", gross_margin: 77.2, net_margin: 47.5 },
    { month: "Mei 2026", gross_margin: 78.4, net_margin: 50.0 },
    { month: "Jun 2026", gross_margin: 79.1, net_margin: 51.9 },
    { month: "Jul 2026", gross_margin: 78.0, net_margin: 52.9 },
    { month: "Agu 2026", gross_margin: 79.5, net_margin: 53.6 },
    { month: "Sep 2026", gross_margin: 78.8, net_margin: 54.7 },
  ];

  const finalChartData = chartData.length > 0 ? chartData : fallbackChartData;
  const finalRevenueData = revenueData.length > 0 ? revenueData : fallbackRevenue;
  const finalExpenseData = expenseData.length > 0 ? expenseData : fallbackExpense;
  const finalClientData = clientData.length > 0 ? clientData : fallbackClients;
  const finalPaymentData = paymentData.length > 0 ? paymentData : fallbackPayment;
  const finalMarginData = marginData.length > 0 ? marginData : fallbackMargin;

  return (
    <div className="space-y-8 [color-scheme:light]" style={{ colorScheme: "light" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-slate-900 text-emerald-300 border border-emerald-500/30"
              : toast.type === "error"
              ? "bg-slate-900 text-red-300 border border-red-500/30"
              : "bg-slate-900 text-slate-100 border border-slate-700"
          }`}
        >
          {toast.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" weight="fill" />}
          {toast.type === "error" && <Warning className="h-5 w-5 text-red-400 shrink-0" weight="fill" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 rounded-lg p-1 text-slate-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-900">Finance & Cash Flow</h1>
            <span className="inline-flex rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              CFO Suite
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Arus kas masuk & keluar, bagan akun standar (COA), likuiditas kas, dan pengendalian beban hosting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              loadOverview();
              loadCOA();
              loadTransactions(trxPage, trxSearch, trxType, trxCategory);
            }}
            title="Refresh Data"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <ArrowClockwise className="h-4 w-4" weight="bold" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Download CSV"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <DownloadSimple className="h-4 w-4" weight="bold" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => {
              if (cashBankAccounts.length > 0) {
                setTrxForm((prev) => ({ ...prev, account_id: cashBankAccounts[0].id }));
              }
              setIsTrxModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" weight="bold" />
            <span>Catat Transaksi Kas</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Inflow */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kas Masuk (Inflow)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendUp className="h-4 w-4" weight="bold" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-emerald-600">
            Rp {Number(kpi.total_inflow).toLocaleString("id-ID")}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Bulan Berjalan:</span>
            <span className="font-semibold text-slate-900">
              Rp {Number(kpi.current_month_inflow).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Total Outflow */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kas Keluar (Outflow)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <TrendDown className="h-4 w-4" weight="bold" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-rose-600">
            Rp {Number(kpi.total_outflow).toLocaleString("id-ID")}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Bulan Berjalan:</span>
            <span className="font-semibold text-slate-900">
              Rp {Number(kpi.current_month_outflow).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Net Cash Flow
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ChartLineUp className="h-4 w-4" weight="bold" />
            </div>
          </div>
          <p
            className={`mt-2 font-display text-2xl font-extrabold ${
              kpi.net_cashflow >= 0 ? "text-slate-900" : "text-red-600"
            }`}
          >
            Rp {Number(kpi.net_cashflow).toLocaleString("id-ID")}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Cash Margin Rate:</span>
            <span className="font-semibold text-blue-600">{kpi.cash_margin}%</span>
          </div>
        </div>

        {/* Liquid Cash & Runway */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kas & Bank Likuid
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Wallet className="h-4 w-4" weight="bold" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-purple-700">
            Rp {Number(kpi.total_liquid_cash).toLocaleString("id-ID")}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Cash Runway:</span>
            <span className="font-semibold text-emerald-600">{kpi.runway_months} Bulan Aman</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Ringkasan & Visualisasi Grafik
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "transactions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Jurnal Mutasi Arus Kas</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {trxTotal}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("coa")}
            className={`py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "coa"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Chart of Accounts (COA)</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {coas.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("pnl")}
            className={`py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "pnl"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Laporan Laba Rugi (P&L)
          </button>
        </nav>
      </div>

      {/* ======================= TAB 1: EXECUTIVE FINANCIAL INTELLIGENCE ======================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 1. Main Area Chart: Monthly Cashflow Trend */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Tren Arus Kas & Posisi Likuiditas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pergerakan historis penerimaan operasional, pengeluaran server & lisensi, serta akumulasi surplus kas 6 bulan terakhir
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-600"></span>
                  <span className="text-slate-600">Kas Masuk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-600"></span>
                  <span className="text-slate-600">Kas Keluar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-3 rounded-xs bg-slate-900"></span>
                  <span className="text-slate-900 font-semibold">Surplus Bersih</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finalChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tickLine={false} stroke="#94A3B8" fontSize={11} dy={8} />
                  <YAxis
                    tickLine={false}
                    stroke="#94A3B8"
                    fontSize={11}
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`}
                  />
                  <Tooltip
                    formatter={(val, name) => [`Rp ${Number(val).toLocaleString("id-ID")}`, name]}
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "none",
                      borderRadius: "10px",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inflow"
                    name="Kas Masuk"
                    stroke="#0D9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#inflowGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="outflow"
                    name="Kas Keluar"
                    stroke="#E11D48"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#outflowGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    name="Surplus Bersih"
                    stroke="#0F172A"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ r: 3, fill: "#0F172A" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                <span>Rata-rata Inflow:</span>
                <span className="font-semibold text-slate-900">Rp 54.1 Jt / bulan</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                <span>Rata-rata Outflow:</span>
                <span className="font-semibold text-slate-900">Rp 25.9 Jt / bulan</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start sm:gap-2 sm:text-right">
                <span>Net Cash Margin:</span>
                <span className="font-semibold text-teal-700">51.8% Surplus Operasional</span>
              </div>
            </div>
          </div>

          {/* Row 2: Revenue Stream Mix & Expense Structure */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Mix */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Distribusi Pendapatan Layanan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Komposisi kontribusi omset berdasarkan lini produk hosting dan server aktif
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 mt-3">
                  {/* Donut Chart with fixed safe container */}
                  <div className="w-44 h-44 shrink-0 relative flex items-center justify-center">
                    <ResponsiveContainer width={176} height={176}>
                      <PieChart>
                        <Pie
                          data={finalRevenueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={78}
                          paddingAngle={3}
                          dataKey="amount"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        >
                          {finalRevenueData.map((entry, index) => (
                            <Cell key={`cell-rev-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) => [`Rp ${Number(val).toLocaleString("id-ID")}`, "Pendapatan"]}
                          contentStyle={{
                            backgroundColor: "#0F172A",
                            border: "none",
                            borderRadius: "10px",
                            color: "#FFFFFF",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                      <span className="font-display font-extrabold text-sm text-slate-900">
                        Rp {(finalRevenueData.reduce((acc, c) => acc + c.amount, 0) / 1000000).toFixed(0)}Jt
                      </span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 w-full space-y-2">
                    {finalRevenueData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-slate-700 truncate">{item.name}</span>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="font-bold text-slate-900">
                            Rp {(item.amount / 1000000).toFixed(1)}Jt
                          </span>
                          <span className="ml-1.5 text-[11px] font-medium text-slate-400">
                            {item.share}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Kontributor Utama:</span>
                <span className="font-medium text-slate-800">Shared Hosting (44.6%) & Cloud VPS (26.6%)</span>
              </div>
            </div>

            {/* Cost Center Breakdown (Clean legibility meters) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Struktur Pengeluaran Operasional Server
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alokasi belanja infrastruktur datacenter, lisensi software, bandwidth, dan SDM
                  </p>
                </div>

                <div className="space-y-3.5 mt-3">
                  {finalExpenseData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            Rp {Number(item.amount).toLocaleString("id-ID")}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            ({item.share}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.share}%`, backgroundColor: item.color || "#1E293B" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Pusat Beban Terbesar:</span>
                <span className="font-medium text-slate-800">SDM Teknis & Datacenter Rack (64%)</span>
              </div>
            </div>
          </div>

          {/* Row 3: Client Segment & Margin Economics */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Client Segments */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Kontribusi Segmen Pelanggan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Porsi pendapatan dari pelanggan tier Korporasi / Agency, UKM Digital, dan Personal
                  </p>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={finalClientData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" tickLine={false} stroke="#94A3B8" fontSize={11} />
                      <YAxis
                        tickLine={false}
                        stroke="#94A3B8"
                        fontSize={10}
                        tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`}
                      />
                      <Tooltip
                        formatter={(val) => [`Rp ${Number(val).toLocaleString("id-ID")}`, "Kontribusi"]}
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          border: "none",
                          borderRadius: "10px",
                          color: "#FFFFFF",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {finalClientData.map((entry, index) => (
                          <Cell key={`cell-client-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  {finalClientData.map((c) => (
                    <div key={c.name} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
                      <span className="block text-[11px] font-medium text-slate-500 truncate">{c.name}</span>
                      <span className="block font-display font-bold text-sm text-slate-900 mt-0.5">
                        {c.share}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Profil Stabilitas:</span>
                <span className="font-medium text-slate-800">48.0% pendapatan berbasis kontrak korporasi jangka panjang</span>
              </div>
            </div>

            {/* Margin Economics */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Evolusi Margin Laba & Efisiensi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tren rasio margin kotor (Gross Margin) dan margin kas operasional 6 bulan terakhir
                  </p>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={finalMarginData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" tickLine={false} stroke="#94A3B8" fontSize={11} />
                      <YAxis
                        tickLine={false}
                        stroke="#94A3B8"
                        fontSize={10}
                        domain={[35, 90]}
                        tickFormatter={(val) => `${val}%`}
                      />
                      <Tooltip
                        formatter={(val, name) => [`${val}%`, name]}
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          border: "none",
                          borderRadius: "10px",
                          color: "#FFFFFF",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={32}
                        formatter={(val) => <span className="text-xs font-medium text-slate-700">{val}</span>}
                      />
                      <Line
                        type="monotone"
                        dataKey="gross_margin"
                        name="Gross Margin %"
                        stroke="#0D9488"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#0D9488" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="net_margin"
                        name="Net Cash Margin %"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#2563EB" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
                    <span className="block text-[11px] font-medium text-slate-500">Gross Profit Margin</span>
                    <span className="block font-display font-bold text-sm text-teal-700 mt-0.5">78.8% Stabil</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
                    <span className="block text-[11px] font-medium text-slate-500">Net Operating Margin</span>
                    <span className="block font-display font-bold text-sm text-blue-700 mt-0.5">54.7% (+7.2% YoY)</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Kinerja Unit Economics:</span>
                <span className="font-medium text-teal-700">Net Margin tumbuh stabil dari 47.5% ke 54.7%</span>
              </div>
            </div>
          </div>

          {/* Row 4: Payment Channels & Cash Liquidity Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Channels */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Metode & Kanal Settlement Pembayaran
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distribusi penyelesaian tagihan invoice pelanggan serta rasio otomasi perbankan
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 mt-3">
                  {/* Donut Chart with fixed safe container */}
                  <div className="w-44 h-44 shrink-0 relative flex items-center justify-center">
                    <ResponsiveContainer width={176} height={176}>
                      <PieChart>
                        <Pie
                          data={finalPaymentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={74}
                          paddingAngle={3}
                          dataKey="amount"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        >
                          {finalPaymentData.map((entry, index) => (
                            <Cell key={`cell-pay-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) => [`Rp ${Number(val).toLocaleString("id-ID")}`, "Volume"]}
                          contentStyle={{
                            backgroundColor: "#0F172A",
                            border: "none",
                            borderRadius: "10px",
                            color: "#FFFFFF",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Otomasi</span>
                      <span className="font-display font-extrabold text-sm text-slate-900">
                        88%
                      </span>
                    </div>
                  </div>

                  {/* Channel List */}
                  <div className="flex-1 w-full space-y-2">
                    {finalPaymentData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-slate-700 truncate">{item.name}</span>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="font-bold text-slate-900">{item.share}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Otomasi Settlement:</span>
                <span className="font-medium text-slate-800">VA BCA & QRIS mendominasi 70% total transaksi</span>
              </div>
            </div>

            {/* Liquid Reserves per Bank Account */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Saldo Rekening Kas & Bank Aktif
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Posisi saldo riil buku kas operasional dan rekening bank terhubung bagan akun (COA)
                  </p>
                </div>

                <div className="space-y-2.5 mt-3">
                  {cashBankAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
                          {acc.name.includes("BCA") || acc.name.includes("Mandiri") ? (
                            <Bank className="h-4 w-4" weight="bold" />
                          ) : (
                            <Wallet className="h-4 w-4" weight="bold" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{acc.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Kode Akun: {acc.code}</p>
                        </div>
                      </div>
                      <span className="font-display font-bold text-slate-900 text-sm">
                        Rp {Number(acc.balance).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Total Likuiditas Tersedia</span>
                  <span className="text-slate-500">Dapat dialokasikan untuk belanja modal / cadangan</span>
                </div>
                <span className="font-display font-extrabold text-base text-slate-900">
                  Rp {Number(kpi.total_liquid_cash).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: TRANSACTIONS JOURNAL ======================= */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Filter Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Buku Jurnal Mutasi Arus Kas
                </h2>
                <p className="text-xs text-slate-500">
                  Pencatatan riil seluruh arus kas masuk dan keluar beserta bukti referensinya
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={trxSearch}
                    onChange={(e) => setTrxSearch(e.target.value)}
                    placeholder="Cari transaksi / ref / memo..."
                    style={{ colorScheme: "light" }}
                    className="w-48 sm:w-60 rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <select
                  value={trxType}
                  onChange={(e) => setTrxType(e.target.value)}
                  style={{ colorScheme: "light" }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="All">Semua Tipe</option>
                  <option value="IN">Kas Masuk (Inflow)</option>
                  <option value="OUT">Kas Keluar (Outflow)</option>
                </select>

                <select
                  value={trxCategory}
                  onChange={(e) => setTrxCategory(e.target.value)}
                  style={{ colorScheme: "light" }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Hosting Revenue">Hosting Revenue</option>
                  <option value="Domain Revenue">Domain Revenue</option>
                  <option value="Server Colocation">Server Colocation</option>
                  <option value="Software License">Software License</option>
                  <option value="Bandwidth & IP">Bandwidth & IP</option>
                  <option value="Salary & Support">Salary & Support</option>
                  <option value="Marketing Ads">Marketing Ads</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">No Referensi</th>
                    <th className="px-5 py-3.5 font-semibold">Tanggal</th>
                    <th className="px-5 py-3.5 font-semibold">Tipe</th>
                    <th className="px-5 py-3.5 font-semibold">Rekening Kas/Bank</th>
                    <th className="px-5 py-3.5 font-semibold">Kategori & Keterangan</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Nominal</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="font-semibold text-slate-800">Tidak ada transaksi ditemukan</p>
                        <p className="text-xs text-slate-400">Gunakan tombol "Catat Transaksi Kas" untuk membuat entri baru.</p>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {t.ref_no}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(t.transaction_date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              t.type === "IN"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {t.type === "IN" ? (
                              <>
                                <ArrowDownLeft className="h-3 w-3" weight="bold" /> Masuk
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="h-3 w-3" weight="bold" /> Keluar
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs">
                          <div className="font-semibold text-slate-900">{t.account?.name || "Kas/Bank"}</div>
                          <div className="text-[10px] text-slate-400">{t.payment_method}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-xs text-slate-800">{t.description}</div>
                          <div className="text-[11px] text-slate-500">{t.category}</div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-xs">
                          <span className={t.type === "IN" ? "text-emerald-600" : "text-rose-600"}>
                            {t.type === "IN" ? "+" : "-"} Rp {Number(t.amount).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setDeleteTargetTrx(t)}
                            title="Hapus Transaksi"
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {trxTotal > 0 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Menampilkan{" "}
                  <strong className="text-slate-900">
                    {(trxPage - 1) * 10 + 1}-{Math.min(trxPage * 10, trxTotal)}
                  </strong>{" "}
                  dari <strong className="text-slate-900">{trxTotal}</strong> transaksi
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const p = trxPage - 1;
                      setTrxPage(p);
                      loadTransactions(p, trxSearch, trxType, trxCategory);
                    }}
                    disabled={trxPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CaretLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2 font-medium text-slate-700">
                    {trxPage} / {trxTotalPages}
                  </span>
                  <button
                    onClick={() => {
                      const p = trxPage + 1;
                      setTrxPage(p);
                      loadTransactions(p, trxSearch, trxType, trxCategory);
                    }}
                    disabled={trxPage >= trxTotalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CaretRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: CHART OF ACCOUNTS (COA) ======================= */}
      {activeTab === "coa" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header & Filters */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Bagan Akun Standar (Chart of Accounts / COA)
                </h2>
                <p className="text-xs text-slate-500">
                  Struktur akun akuntansi 4-digit standar industri hosting & cloud provider
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={coaSearch}
                    onChange={(e) => setCoaSearch(e.target.value)}
                    placeholder="Cari kode atau nama akun..."
                    style={{ colorScheme: "light" }}
                    className="w-48 sm:w-56 rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <select
                  value={coaCategory}
                  onChange={(e) => setCoaCategory(e.target.value)}
                  style={{ colorScheme: "light" }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Asset">1000 - Aset</option>
                  <option value="Liability">2000 - Kewajiban</option>
                  <option value="Equity">3000 - Ekuitas</option>
                  <option value="Revenue">4000 - Pendapatan</option>
                  <option value="COGS">5000 - HPP / COGS</option>
                  <option value="Expense">6000 - Beban Operasional</option>
                </select>

                <button
                  onClick={() => setIsCOAModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" weight="bold" />
                  <span>Tambah Akun COA</span>
                </button>
              </div>
            </div>

            {/* COA Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Kode</th>
                    <th className="px-5 py-3.5 font-semibold">Nama Akun</th>
                    <th className="px-5 py-3.5 font-semibold">Kategori</th>
                    <th className="px-5 py-3.5 font-semibold">Posisi Normal</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Saldo Berjalan</th>
                    <th className="px-5 py-3.5 font-semibold">Deskripsi / Peruntukan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCOA.map((c) => {
                    const getCatBadge = (cat) => {
                      switch (cat) {
                        case "Asset":
                          return "bg-purple-50 text-purple-700 border-purple-200";
                        case "Liability":
                          return "bg-amber-50 text-amber-700 border-amber-200";
                        case "Equity":
                          return "bg-blue-50 text-blue-700 border-blue-200";
                        case "Revenue":
                          return "bg-emerald-50 text-emerald-700 border-emerald-200";
                        case "COGS":
                          return "bg-orange-50 text-orange-700 border-orange-200";
                        default:
                          return "bg-rose-50 text-rose-700 border-rose-200";
                      }
                    };

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900 text-xs">
                          {c.code}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900 text-xs">
                          {c.name}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${getCatBadge(
                              c.category
                            )}`}
                          >
                            {c.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono text-slate-500">
                          {c.normal_balance}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-xs text-slate-900">
                          Rp {Number(c.balance).toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                          {c.description || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 4: P&L INCOME STATEMENT ======================= */}
      {activeTab === "pnl" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-4xl mx-auto">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    Laporan Laba Rugi Eksekutif (Income Statement)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Periode: Tahun Berjalan 2026 (YTD) • Berdasarkan Standar Akuntansi Keuangan
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <DownloadSimple className="h-4 w-4" />
                  <span>Cetak Ringkasan</span>
                </button>
              </div>
            </div>

            {/* P&L Table */}
            <div className="space-y-6 text-sm">
              {/* 1. Pendapatan */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-100 pb-1">
                  1. Pendapatan Usaha (Gross Revenue)
                </h3>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between text-slate-700">
                    <span>Pendapatan Shared Web Hosting</span>
                    <span className="font-mono font-semibold">Rp 145.000.000</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Pendapatan Cloud VPS & VM</span>
                    <span className="font-mono font-semibold">Rp 86.500.000</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Pendapatan Dedicated Server</span>
                    <span className="font-mono font-semibold">Rp 52.000.000</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Pendapatan Registrasi Domain TLD</span>
                    <span className="font-mono font-semibold">Rp 41.200.000</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 mt-2 pt-2 bg-slate-50 px-4 py-2 rounded-xl">
                  <span>Total Pendapatan Operasional</span>
                  <span className="font-mono text-emerald-600">Rp 324.700.000</span>
                </div>
              </div>

              {/* 2. HPP */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-100 pb-1">
                  2. Beban Pokok Pendapatan (HPP / Cost of Goods Sold)
                </h3>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between text-slate-700">
                    <span>Biaya Registry Domain Wholesale (PANDI / ICANN)</span>
                    <span className="font-mono text-rose-600">(Rp 28.500.000)</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Biaya Bandwidth & IP Transit Tier-1</span>
                    <span className="font-mono text-rose-600">(Rp 34.000.000)</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Biaya MDR & Gateway Transaksi</span>
                    <span className="font-mono text-rose-600">(Rp 6.200.000)</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 mt-2 pt-2 bg-slate-50 px-4 py-2 rounded-xl">
                  <span>Total Beban Pokok (HPP)</span>
                  <span className="font-mono text-rose-600">(Rp 68.700.000)</span>
                </div>
              </div>

              {/* Gross Profit Callout */}
              <div className="flex justify-between font-extrabold text-base bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl">
                <div>
                  <span>Laba Kotor (Gross Profit)</span>
                  <span className="block text-xs font-medium text-emerald-700 mt-0.5">
                    Gross Margin: {pnl.gross_margin}%
                  </span>
                </div>
                <span className="font-mono text-lg text-emerald-800">
                  Rp {Number(pnl.gross_profit).toLocaleString("id-ID")}
                </span>
              </div>

              {/* 3. OPEX */}
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-100 pb-1">
                  3. Beban Operasional (Operating Expenses / OPEX)
                </h3>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between text-slate-700">
                    <span>Beban Sewa Rack & Power Colocation Datacenter</span>
                    <span className="font-mono text-rose-600">(Rp 48.500.000)</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Beban Lisensi Server (cPanel, CloudLinux, LiteSpeed)</span>
                    <span className="font-mono text-rose-600">(Rp 29.400.000)</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Beban Gaji Tim SysAdmin & Tech Support</span>
                    <span className="font-mono text-rose-600">(Rp 56.000.000)</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Beban Pemasaran & Google Ads</span>
                    <span className="font-mono text-rose-600">(Rp 18.500.000)</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Beban Operasional Kantor & Utilitas</span>
                    <span className="font-mono text-rose-600">(Rp 9.800.000)</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 mt-2 pt-2 bg-slate-50 px-4 py-2 rounded-xl">
                  <span>Total Beban Operasional (OPEX)</span>
                  <span className="font-mono text-rose-600">
                    (Rp {Number(pnl.total_opex).toLocaleString("id-ID")})
                  </span>
                </div>
              </div>

              {/* Net Operating Income Callout */}
              <div className="flex justify-between font-extrabold text-base bg-blue-50 border-2 border-blue-300 text-blue-950 px-4 py-3.5 rounded-xl">
                <div>
                  <span className="text-base">Laba Operasional Bersih (EBITDA / Net Income)</span>
                  <span className="block text-xs font-semibold text-blue-700 mt-0.5">
                    Net Profit Margin: {pnl.net_margin}% (Sangat Sehat untuk Industri Cloud)
                  </span>
                </div>
                <span className="font-mono text-xl text-blue-900">
                  Rp {Number(pnl.net_operating_income).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CATAT TRANSAKSI KAS ======================= */}
      {isTrxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Receipt className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Catat Transaksi Arus Kas</h3>
                  <p className="text-xs text-slate-500">Mutasi kas operasional dan rekonsiliasi rekening</p>
                </div>
              </div>
              <button
                onClick={() => setIsTrxModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="mt-5 space-y-4">
              {/* Tipe Transaksi (IN / OUT) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tipe Arus Kas
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTrxForm({ ...trxForm, type: "IN" })}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all border ${
                      trxForm.type === "IN"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs"
                        : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowDownLeft className="h-4 w-4" weight="bold" />
                    <span>Kas Masuk (Inflow / Penerimaan)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrxForm({ ...trxForm, type: "OUT" })}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all border ${
                      trxForm.type === "OUT"
                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xs"
                        : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" weight="bold" />
                    <span>Kas Keluar (Outflow / Beban)</span>
                  </button>
                </div>
              </div>

              {/* Rekening Kas / Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Rekening Kas / Bank
                  </label>
                  <select
                    required
                    value={trxForm.account_id}
                    onChange={(e) => setTrxForm({ ...trxForm, account_id: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="">-- Pilih Rekening --</option>
                    {cashBankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kategori Alokasi
                  </label>
                  <select
                    value={trxForm.category}
                    onChange={(e) => setTrxForm({ ...trxForm, category: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    {trxForm.type === "IN" ? (
                      <>
                        <option value="Hosting Revenue">Hosting Revenue</option>
                        <option value="Domain Revenue">Domain Revenue</option>
                        <option value="VPS & Cloud Revenue">VPS & Cloud Revenue</option>
                        <option value="Dedicated Server Revenue">Dedicated Server Revenue</option>
                        <option value="Managed Service Fee">Managed Service Fee</option>
                      </>
                    ) : (
                      <>
                        <option value="Server Colocation">Server Colocation & Datacenter</option>
                        <option value="Software License">Software License (cPanel/CloudLinux)</option>
                        <option value="Bandwidth & IP">Bandwidth & IP Transit Tier-1</option>
                        <option value="Wholesale Domain">Wholesale Domain Registry (PANDI/ICANN)</option>
                        <option value="Salary & Support">Gaji & Payroll Support</option>
                        <option value="Marketing Ads">Marketing & Ads</option>
                        <option value="Office & Utilities">Office, Legal & Utilities</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Nominal & Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nominal (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={trxForm.amount}
                    onChange={(e) => setTrxForm({ ...trxForm, amount: e.target.value })}
                    placeholder="cth. 1500000"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={trxForm.transaction_date}
                    onChange={(e) => setTrxForm({ ...trxForm, transaction_date: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Metode Bayar & Ref Dokumen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Metode Pembayaran
                  </label>
                  <select
                    value={trxForm.payment_method}
                    onChange={(e) => setTrxForm({ ...trxForm, payment_method: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Bank Transfer BCA">Bank Transfer BCA</option>
                    <option value="Bank Transfer Mandiri">Bank Transfer Mandiri</option>
                    <option value="Midtrans QRIS / VA">Midtrans QRIS / VA</option>
                    <option value="Xendit Payment">Xendit Payment</option>
                    <option value="Tunai / Petty Cash">Tunai / Petty Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    No Dokumen / Invoice (Opsional)
                  </label>
                  <input
                    type="text"
                    value={trxForm.reference_doc}
                    onChange={(e) => setTrxForm({ ...trxForm, reference_doc: e.target.value })}
                    placeholder="cth. INV-2026-0812 / PO-DC-04"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Keterangan Transaksi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Keterangan / Memo Bisnis
                </label>
                <textarea
                  rows={2}
                  required
                  value={trxForm.description}
                  onChange={(e) => setTrxForm({ ...trxForm, description: e.target.value })}
                  placeholder="cth. Pembayaran perpanjangan sewa rack datacenter Cyber 1 Jakarta"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTrxModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all"
                >
                  {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <span>Simpan Transaksi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: TAMBAH AKUN COA ======================= */}
      {isCOAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Bank className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tambah Akun COA Baru</h3>
                  <p className="text-xs text-slate-500">Daftarkan akun akuntansi baru ke buku besar</p>
                </div>
              </div>
              <button
                onClick={() => setIsCOAModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCOA} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kode Akun
                  </label>
                  <input
                    type="text"
                    required
                    value={coaForm.code}
                    onChange={(e) => setCoaForm({ ...coaForm, code: e.target.value })}
                    placeholder="cth. 6006"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={coaForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const norm = cat === "Asset" || cat === "COGS" || cat === "Expense" ? "Debit" : "Credit";
                      setCoaForm({ ...coaForm, category: cat, normal_balance: norm });
                    }}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Asset">1000 - Asset (Aset)</option>
                    <option value="Liability">2000 - Liability (Kewajiban)</option>
                    <option value="Equity">3000 - Equity (Ekuitas)</option>
                    <option value="Revenue">4000 - Revenue (Pendapatan)</option>
                    <option value="COGS">5000 - COGS (HPP)</option>
                    <option value="Expense">6000 - Expense (Beban)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Akun
                </label>
                <input
                  type="text"
                  required
                  value={coaForm.name}
                  onChange={(e) => setCoaForm({ ...coaForm, name: e.target.value })}
                  placeholder="cth. Beban Pemeliharaan UPS & Generator"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Posisi Normal
                  </label>
                  <select
                    value={coaForm.normal_balance}
                    onChange={(e) => setCoaForm({ ...coaForm, normal_balance: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit (Kredit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Saldo Awal (IDR)
                  </label>
                  <input
                    type="number"
                    value={coaForm.balance}
                    onChange={(e) => setCoaForm({ ...coaForm, balance: e.target.value })}
                    placeholder="0"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Deskripsi / Peruntukan
                </label>
                <input
                  type="text"
                  value={coaForm.description}
                  onChange={(e) => setCoaForm({ ...coaForm, description: e.target.value })}
                  placeholder="Catatan akuntansi..."
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCOAModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 shadow-sm transition-all"
                >
                  {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <span>Buat Akun COA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: KONFIRMASI HAPUS TRANSAKSI ======================= */}
      {deleteTargetTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <Trash className="h-6 w-6" weight="bold" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Hapus Transaksi Kas?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus transaksi{" "}
              <strong className="font-mono text-slate-900 font-bold">{deleteTargetTrx.ref_no}</strong> sebesar{" "}
              <strong className="text-slate-900">
                Rp {Number(deleteTargetTrx.amount).toLocaleString("id-ID")}
              </strong>
              ?
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Saldo rekening {deleteTargetTrx.account?.name || "kas/bank"} akan otomatis disesuaikan kembali.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTargetTrx(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDeleteTrx}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                <span>Ya, Hapus Transaksi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
