import React, { useState, useEffect } from "react";
import {
  DownloadSimple,
  Funnel,
  MagnifyingGlass,
  Receipt,
  FilePdf,
  PaperPlaneTilt,
  CheckCircle,
  Clock,
  CircleNotch,
  CaretLeft,
  CaretRight,
  X,
  Warning,
  Printer,
  Plus,
  ArrowClockwise,
  Lightning,
  ShieldCheck,
  Lock,
  Play,
  GearSix,
  Check,
} from "@phosphor-icons/react";
import { api } from "../../lib/auth";

export default function AdminBilling() {
  const [stats, setStats] = useState({
    unpaid_total: 0,
    unpaid_count: 0,
    overdue_total: 0,
    overdue_count: 0,
    revenue_30_days: 0,
  });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Table Controls
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals & Actions
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [clientsList, setClientsList] = useState([]);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [toast, setToast] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState({
    user_id: "",
    amount: "",
    due_date: "",
    status: "Unpaid",
  });

  // Tab Navigation: Invoices vs Dunning Automator
  const [billingTab, setBillingTab] = useState("invoices"); // "invoices" | "dunning"
  const [dunningSettings, setDunningSettings] = useState({
    auto_invoice_days: 14,
    auto_suspend_days: 3,
    auto_terminate_days: 30,
    is_enabled: true,
    notify_email: true,
  });
  const [dunningLogs, setDunningLogs] = useState([]);
  const [runningDunning, setRunningDunning] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

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

  const fetchDunningData = async () => {
    try {
      const [sRes, lRes] = await Promise.all([
        api.get("/admin/dunning/settings"),
        api.get("/admin/dunning/logs"),
      ]);
      if (sRes && sRes.data) setDunningSettings(sRes.data);
      if (lRes && lRes.data) setDunningLogs(lRes.data);
    } catch (e) {
      console.error("Gagal memuat dunning data:", e);
    }
  };

  const handleRunDunningNow = async () => {
    try {
      setRunningDunning(true);
      const res = await api.post("/admin/dunning/run");
      showToast("success", res.message || "Billing Lifecycle Automator berhasil dieksekusi!");
      await fetchDunningData();
      await fetchStats();
      await fetchInvoices();
    } catch (e) {
      showToast("error", e.message || "Gagal menjalankan otomatisasi dunning.");
    } finally {
      setRunningDunning(false);
    }
  };

  const handleSaveDunningSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.put("/admin/dunning/settings", {
        auto_invoice_days: parseInt(dunningSettings.auto_invoice_days, 10),
        auto_suspend_days: parseInt(dunningSettings.auto_suspend_days, 10),
        auto_terminate_days: parseInt(dunningSettings.auto_terminate_days, 10),
        is_enabled: dunningSettings.is_enabled,
        notify_email: dunningSettings.notify_email,
      });
      showToast("success", res.message || "Pengaturan dunning berhasil disimpan!");
      if (res && res.data) setDunningSettings(res.data);
    } catch (e) {
      showToast("error", e.message || "Gagal menyimpan pengaturan dunning.");
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    if (billingTab === "dunning") {
      fetchDunningData();
    }
  }, [billingTab]);

  async function fetchStats() {
    try {
      const res = await api("GET", "/admin/billing/stats");
      if (res && !res.error) setStats(res);
    } catch (e) {
      console.error("Gagal memuat stats:", e);
    }
  }

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await api(
        "GET",
        `/admin/billing/invoices?page=${page}&limit=10&search=${encodeURIComponent(
          search
        )}&status=${statusFilter}`
      );
      if (res && !res.error) {
        setInvoices(res.data || []);
        setTotalPages(res.total_pages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (e) {
      console.error("Gagal memuat invoices:", e);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  // Load clients for create invoice dropdown
  async function loadClients() {
    try {
      const res = await api("GET", "/admin/clients?per_page=100");
      if (res && res.data) {
        setClientsList(res.data);
        if (res.data.length > 0 && !invoiceForm.user_id) {
          setInvoiceForm((f) => ({ ...f, user_id: res.data[0].id }));
        }
      }
    } catch (e) {
      console.error("Gagal memuat list clients:", e);
    }
  }

  const handleOpenCreateModal = () => {
    loadClients();
    setInvoiceForm({
      user_id: clientsList[0]?.id || "",
      amount: "",
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "Unpaid",
    });
    setShowCreateModal(true);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.user_id) {
      showToast("error", "Pilih client terlebih dahulu.");
      return;
    }
    const numAmount = parseFloat(invoiceForm.amount);
    if (!numAmount || numAmount <= 0) {
      showToast("error", "Nominal tagihan harus lebih dari 0.");
      return;
    }

    try {
      setSubmittingInvoice(true);
      await api("POST", "/admin/billing/invoices", {
        user_id: Number(invoiceForm.user_id),
        amount: numAmount,
        due_date: invoiceForm.due_date,
        status: invoiceForm.status,
      });
      showToast("success", "Invoice baru berhasil dibuat!");
      setShowCreateModal(false);
      fetchStats();
      fetchInvoices();
    } catch (err) {
      showToast("error", err.message || "Gagal membuat invoice.");
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await api("POST", "/admin/billing/seed");
      showToast("success", res.message || "Mock data invoice berhasil digenerate!");
      setPage(1);
      await fetchStats();
      await fetchInvoices();
    } catch (err) {
      showToast("error", err.message || "Gagal generate mock data.");
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleStatus = async (inv) => {
    const nextStatus = inv.status === "Paid" ? "Unpaid" : "Paid";
    try {
      await api("PUT", `/admin/billing/invoices/${inv.id}/status`, {
        status: nextStatus,
      });
      showToast("success", `Status ${inv.id} diubah menjadi ${nextStatus}`);
      fetchStats();
      fetchInvoices();
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah status invoice.");
    }
  };

  const handleSendReminder = async (inv) => {
    try {
      const res = await api("POST", `/admin/billing/invoices/${inv.id}/remind`);
      showToast("success", res.message || `Pengingat tagihan ${inv.id} berhasil dikirim ke ${inv.client}! 📧`);
    } catch (err) {
      showToast("error", err.message || "Gagal mengirimkan pengingat tagihan.");
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      showToast("info", "Tidak ada data invoice untuk diekspor.");
      return;
    }

    const headers = ["Invoice ID", "Client", "Amount", "Issue Date", "Due Date", "Status"];
    const rows = invoices.map((i) => [
      i.id,
      `"${i.client.replace(/"/g, '""')}"`,
      i.amount,
      i.date,
      i.due,
      i.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kioshosting-invoices-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "File CSV invoice berhasil diunduh.");
  };

  return (
    <div className="space-y-6 [color-scheme:light]" style={{ colorScheme: "light" }}>
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
          {toast.type === "info" && <Receipt className="h-5 w-5 text-blue-400 shrink-0" weight="bold" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Billing & Invoices</h1>
          <p className="text-sm text-slate-500">Kelola seluruh transaksi keuangan dan siklus tagihan KiosHosting</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            {seeding ? (
              <CircleNotch className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <ArrowClockwise className="h-4 w-4" />
            )}
            <span>Generate Mock Data</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            <Receipt className="h-5 w-5" weight="bold" />
            <span>Buat Invoice</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setBillingTab("invoices")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            billingTab === "invoices"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Receipt weight={billingTab === "invoices" ? "fill" : "duotone"} className="h-4 w-4" />
          Daftar Tagihan & Invoice
        </button>

        <button
          onClick={() => setBillingTab("dunning")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            billingTab === "dunning"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Lightning weight={billingTab === "dunning" ? "fill" : "duotone"} className="h-4 w-4 text-amber-400" />
          Billing Lifecycle & Dunning Automator
        </button>
      </div>

      {/* ==================== TAB 1: INVOICES & STATS ==================== */}
      {billingTab === "invoices" && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Unpaid Invoices</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900">
            Rp {(stats.unpaid_total || 0).toLocaleString("id-ID")}
          </p>
          <p className="mt-2 text-xs font-semibold text-amber-600 bg-amber-50 inline-block px-2.5 py-0.5 rounded-full border border-amber-200/50">
            {stats.unpaid_count || 0} tagihan pending
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Overdue (Dunning)</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900">
            Rp {(stats.overdue_total || 0).toLocaleString("id-ID")}
          </p>
          <p className="mt-2 text-xs font-semibold text-red-600 bg-red-50 inline-block px-2.5 py-0.5 rounded-full border border-red-200/50">
            {stats.overdue_count || 0} jatuh tempo
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Revenue (30 Hari Terakhir)</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900">
            Rp {(stats.revenue_30_days || 0).toLocaleString("id-ID")}
          </p>
          <p className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-2.5 py-0.5 rounded-full border border-emerald-200/50">
            Lunas dalam 30 hari
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 p-4">
          <div className="relative w-full sm:max-w-xs">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari ID invoice atau client..."
              style={{ colorScheme: "light" }}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 py-1">
              <Funnel className="h-4 w-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={{ colorScheme: "light" }}
                className="bg-white py-1 pr-1 text-sm font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">Semua Status</option>
                <option value="Paid">Paid (Lunas)</option>
                <option value="Unpaid">Unpaid (Pending)</option>
                <option value="Overdue">Overdue (Jatuh Tempo)</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 active:scale-95"
            >
              <DownloadSimple className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Nominal</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CircleNotch className="h-7 w-7 animate-spin text-blue-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-slate-500">Memuat data invoice...</span>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="text-base font-semibold text-slate-700">Tidak ada invoice ditemukan</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Klik "Generate Mock Data" di atas untuk mengisi data simulasi pengujian.
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 font-mono text-sm">{inv.id}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {inv.client}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      Rp {Number(inv.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">{inv.date}</div>
                      <div className="text-[11px] text-slate-500">Due: {inv.due}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(inv)}
                        title="Klik untuk toggle status"
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                          inv.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : inv.status === "Unpaid"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {inv.status === "Paid" && <CheckCircle weight="bold" className="h-3.5 w-3.5 text-emerald-600" />}
                        {inv.status === "Unpaid" && <Clock weight="bold" className="h-3.5 w-3.5 text-amber-600" />}
                        {inv.status === "Overdue" && <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>}
                        <span>{inv.status}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSendReminder(inv)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Kirim Pengingat Tagihan"
                        >
                          <PaperPlaneTilt className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                          title="Lihat & Cetak Invoice"
                        >
                          <FilePdf className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-6 py-4 gap-4">
          <p className="text-sm text-slate-500">
            Halaman <span className="font-semibold text-slate-900">{page}</span> dari{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span> (Total{" "}
            <span className="font-semibold text-slate-900">{totalCount}</span> invoice)
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CaretLeft className="h-4 w-4" /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <CaretRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {/* ==================== TAB 2: DUNNING & LIFECYCLE AUTOMATOR ==================== */}
      {billingTab === "dunning" && (
        <div className="space-y-6">
          {/* Visual Policy Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wide border border-amber-200">
                  <Lightning weight="fill" className="h-3.5 w-3.5" />
                  Scheduled Automated Engine
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 font-display">
                  Siklus Penagihan & Otomasi Dunning (H-14, H+3, H+30)
                </h3>
                <p className="text-xs text-slate-500">
                  Cron job berjalan setiap 1 jam untuk memproses invoice perpanjangan, pembekuan otomatis, dan pembersihan server.
                </p>
              </div>

              <button
                onClick={handleRunDunningNow}
                disabled={runningDunning}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-[0.98] shrink-0"
              >
                {runningDunning ? (
                  <CircleNotch className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Play weight="fill" className="h-4 w-4" />
                )}
                Jalankan Otomasi Sekarang
              </button>
            </div>

            {/* Timeline Stepper */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 relative">
                <div className="h-7 w-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2 shadow-sm">
                  1
                </div>
                <div className="text-xs font-bold text-blue-900">H-14: Terbitkan Invoice</div>
                <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
                  Sistem otomatis men-generate invoice perpanjangan 14 hari sebelum layanan expired & mengirim notifikasi WhatsApp/Email.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative">
                <div className="h-7 w-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center mb-2 shadow-sm">
                  2
                </div>
                <div className="text-xs font-bold text-slate-900">Hari H: Jatuh Tempo</div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Layanan mencapai tanggal kadaluarsa. Notifikasi tagihan jatuh tempo terkirim ke klien secara otomatis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 relative">
                <div className="h-7 w-7 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center mb-2 shadow-sm">
                  3
                </div>
                <div className="text-xs font-bold text-amber-900">H+3: Auto-Suspend</div>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  Jika belum dibayar, akun hosting/VPS otomatis dibekukan di server cPanel/Proxmox untuk menghentikan konsumsi bandwidth.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 relative">
                <div className="h-7 w-7 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center mb-2 shadow-sm">
                  4
                </div>
                <div className="text-xs font-bold text-rose-900">H+30: Auto-Terminate</div>
                <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                  Setelah 30 hari menunggak, data akun dihapus dari server untuk mencegah resource starvation & membebaskan storage.
                </p>
              </div>
            </div>
          </div>

          {/* Dunning Configuration Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <GearSix weight="duotone" className="h-5 w-5 text-slate-600" />
              Parameter Kebijakan Dunning
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Sesuaikan ambang batas hari dan notifikasi otomatis sesuai kebijakan operasional KiosHosting.
            </p>

            <form onSubmit={handleSaveDunningSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-700 block">
                  Invoice Perpanjangan (Hari Sebelum Expired)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 text-sm">H -</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={dunningSettings.auto_invoice_days}
                    onChange={(e) =>
                      setDunningSettings({ ...dunningSettings, auto_invoice_days: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <span className="text-slate-500 font-medium">Hari</span>
                </div>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-700 block">
                  Auto-Suspend Layanan (Hari Setelah Telat)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 text-sm">H +</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={dunningSettings.auto_suspend_days}
                    onChange={(e) =>
                      setDunningSettings({ ...dunningSettings, auto_suspend_days: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <span className="text-slate-500 font-medium">Hari</span>
                </div>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-700 block">
                  Auto-Terminate & Purge Data (Hari)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 text-sm">H +</span>
                  <input
                    type="number"
                    min="7"
                    max="90"
                    value={dunningSettings.auto_terminate_days}
                    onChange={(e) =>
                      setDunningSettings({ ...dunningSettings, auto_terminate_days: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <span className="text-slate-500 font-medium">Hari</span>
                </div>
              </div>

              <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dunningSettings.is_enabled}
                      onChange={(e) =>
                        setDunningSettings({ ...dunningSettings, is_enabled: e.target.checked })
                      }
                      className="h-4 w-4 text-amber-600 rounded border-slate-300"
                    />
                    <span className="font-semibold text-slate-800">
                      Aktifkan Dunning Automator Otomatis
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dunningSettings.notify_email}
                      onChange={(e) =>
                        setDunningSettings({ ...dunningSettings, notify_email: e.target.checked })
                      }
                      className="h-4 w-4 text-amber-600 rounded border-slate-300"
                    />
                    <span className="font-semibold text-slate-800">
                      Kirim Email Notifikasi ke Klien
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm transition-all"
                >
                  {savingSettings ? "Menyimpan..." : "Simpan Parameter Dunning"}
                </button>
              </div>
            </form>
          </div>

          {/* Dunning Execution History Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Riwayat Eksekusi Otomasi Dunning</h3>
                <p className="text-xs text-slate-500">Audit trail cron runner dan pemicu manual</p>
              </div>
              <button
                onClick={fetchDunningData}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowClockwise className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Waktu Eksekusi</th>
                    <th className="py-3 px-4">Pemicu</th>
                    <th className="py-3 px-4">Invoice Dibuat (H-14)</th>
                    <th className="py-3 px-4">Akun Disuspend (H+3)</th>
                    <th className="py-3 px-4">Akun Diterminate (H+30)</th>
                    <th className="py-3 px-4">Durasi</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dunningLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        Belum ada riwayat eksekusi dunning.
                      </td>
                    </tr>
                  ) : (
                    dunningLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {new Date(log.executed_at).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              log.triggered_by === "cron"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {log.triggered_by}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          +{log.invoices_generated}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-600">
                          {log.services_suspended}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-rose-600">
                          {log.services_terminated}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {log.duration_ms}ms
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle weight="fill" className="h-3.5 w-3.5 text-emerald-500" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE INVOICE MODAL ==================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Receipt className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Buat Invoice Baru</h3>
                  <p className="text-xs text-slate-500">Terbitkan tagihan baru untuk klien</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pilih Client
                </label>
                <select
                  required
                  value={invoiceForm.user_id}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, user_id: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Client Terdaftar --</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nominal Tagihan (IDR)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  placeholder="cth. 500000"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Status Awal
                  </label>
                  <select
                    value={invoiceForm.status}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingInvoice}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all"
                >
                  {submittingInvoice && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <span>Terbitkan Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PREVIEW INVOICE MODAL ==================== */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Receipt className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{previewInvoice.id}</h3>
                  <p className="text-xs text-slate-500">Invoice Resmi KiosHosting.id</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Ditagihkan Kepada</span>
                  <div className="font-bold text-slate-900 text-base">{previewInvoice.client}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Status Pembayaran</span>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        previewInvoice.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : previewInvoice.status === "Unpaid"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {previewInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs text-slate-400">Tanggal Terbit</p>
                  <p className="font-semibold text-slate-700">{previewInvoice.date}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Jatuh Tempo</p>
                  <p className="font-semibold text-slate-700">{previewInvoice.due}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-slate-800">Total Tagihan:</span>
                <span className="text-2xl font-display font-extrabold text-blue-600">
                  Rp {Number(previewInvoice.amount).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
