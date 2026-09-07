import React, { useState, useEffect } from "react";
import {
  FloppyDisk,
  Key,
  LinkSimple,
  Users,
  Buildings,
  Eye,
  EyeSlash,
  Plus,
  Trash,
  PencilSimple,
  X,
  CircleNotch,
  CheckCircle,
  Warning,
  ShieldCheck,
} from "@phosphor-icons/react";
import { api } from "../../lib/auth";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Settings State
  const [config, setConfig] = useState({
    company_name: "KiosHosting.id",
    support_email: "support@kioshosting.id",
    company_phone: "+62 812-3456-7890",
    company_address: "Cyber 1 Building, Jakarta Selatan, Indonesia",
    default_currency: "IDR (Rupiah)",
    auto_suspend_days: 3,
    auto_terminate_days: 30,
    midtrans_environment: "Sandbox",
    midtrans_server_key: "",
    midtrans_client_key: "",
    reseller_club_id: "",
    reseller_club_api_key: "",
  });

  const [webhooks, setWebhooks] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Visibility toggles
  const [showMidtransServerKey, setShowMidtransServerKey] = useState(false);
  const [showResellerApiKey, setShowResellerApiKey] = useState(false);

  // Modals state
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    name: "",
    url: "",
    events: "invoice.paid,ticket.opened",
    secret_key: "",
  });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "support_agent",
  });

  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState(null);
  const [deleteConfirmWebhook, setDeleteConfirmWebhook] = useState(null);

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

  // Load all initial data
  async function loadData() {
    setLoading(true);
    try {
      const [configRes, webhooksRes, staffRes] = await Promise.all([
        api("GET", "/admin/settings"),
        api("GET", "/admin/settings/webhooks"),
        api("GET", "/admin/settings/staff"),
      ]);

      if (configRes.config) setConfig(configRes.config);
      if (webhooksRes.webhooks) setWebhooks(webhooksRes.webhooks);
      if (staffRes.staff) setStaffList(staffRes.staff);
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err);
      showToast("error", "Gagal memuat konfigurasi sistem.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Save General / API Configuration
  async function handleSaveConfig(e) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await api("PUT", "/admin/settings", config);
      if (res.config) setConfig(res.config);
      showToast("success", res.message || "Pengaturan berhasil disimpan!");
    } catch (err) {
      showToast("error", err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  // Webhook handlers
  async function handleCreateWebhook(e) {
    e.preventDefault();
    if (!webhookForm.name.trim() || !webhookForm.url.trim()) {
      showToast("error", "Nama dan URL webhook wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      const res = await api("POST", "/admin/settings/webhooks", webhookForm);
      setWebhooks((prev) => [res.webhook, ...prev]);
      setIsWebhookModalOpen(false);
      setWebhookForm({
        name: "",
        url: "",
        events: "invoice.paid,ticket.opened",
        secret_key: "",
      });
      showToast("success", "Endpoint webhook berhasil ditambahkan!");
    } catch (err) {
      showToast("error", err.message || "Gagal menambahkan webhook.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWebhook() {
    if (!deleteConfirmWebhook) return;
    try {
      setSaving(true);
      await api("DELETE", `/admin/settings/webhooks/${deleteConfirmWebhook.id}`);
      setWebhooks((prev) => prev.filter((w) => w.id !== deleteConfirmWebhook.id));
      setDeleteConfirmWebhook(null);
      showToast("success", "Webhook berhasil dihapus.");
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus webhook.");
    } finally {
      setSaving(false);
    }
  }

  // Staff handlers
  async function handleCreateStaff(e) {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.password.trim()) {
      showToast("error", "Semua data staff wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      const res = await api("POST", "/admin/settings/staff", staffForm);
      setStaffList((prev) => [...prev, res.user]);
      setIsStaffModalOpen(false);
      setStaffForm({
        name: "",
        email: "",
        password: "",
        role: "support_agent",
      });
      showToast("success", "Staff baru berhasil ditambahkan!");
    } catch (err) {
      showToast("error", err.message || "Gagal menambahkan staff.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStaffRole(e) {
    e.preventDefault();
    if (!editingStaff) return;
    try {
      setSaving(true);
      const res = await api("PUT", `/admin/settings/staff/${editingStaff.id}`, {
        name: editingStaff.name,
        role: editingStaff.role,
        status: editingStaff.status,
      });

      setStaffList((prev) => prev.map((s) => (s.id === editingStaff.id ? res.user : s)));
      setEditingStaff(null);
      showToast("success", "Data staff berhasil diperbarui!");
    } catch (err) {
      showToast("error", err.message || "Gagal memperbarui staff.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStaff() {
    if (!deleteConfirmStaff) return;
    try {
      setSaving(true);
      await api("DELETE", `/admin/settings/staff/${deleteConfirmStaff.id}`);
      setStaffList((prev) => prev.filter((s) => s.id !== deleteConfirmStaff.id));
      setDeleteConfirmStaff(null);
      showToast("success", "Staff berhasil dihapus.");
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus staff.");
    } finally {
      setSaving(false);
    }
  }

  function getRoleBadge(role) {
    switch (role) {
      case "superadmin":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "support_agent":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "billing_admin":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  }

  function getRoleLabel(role) {
    switch (role) {
      case "superadmin":
        return "Superadmin";
      case "support_agent":
        return "Support Agent";
      case "billing_admin":
        return "Billing Admin";
      default:
        return role;
    }
  }

  return (
    <div className="space-y-6 max-w-5xl [color-scheme:light]" style={{ colorScheme: "light" }}>
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
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500">Konfigurasi informasi perusahaan, gerbang pembayaran, dan hak akses staf</p>
        </div>
        <button
          onClick={handleSaveConfig}
          disabled={saving || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {saving ? <CircleNotch className="h-4 w-4 animate-spin" /> : <FloppyDisk className="h-4 w-4" weight="bold" />}
          <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <CircleNotch className="h-8 w-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat konfigurasi sistem...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="w-full lg:w-[240px] shrink-0">
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible">
              {[
                { id: "general", label: "General Config", icon: Buildings },
                { id: "api", label: "API Credentials", icon: Key },
                { id: "webhooks", label: "Webhooks", icon: LinkSimple, badge: webhooks.length },
                { id: "staff", label: "Staff & RBAC", icon: Users, badge: staffList.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all whitespace-nowrap text-left ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon weight={isActive ? "fill" : "duotone"} className="h-5 w-5 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          isActive ? "bg-blue-200 text-blue-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 space-y-6">
            {/* 1. GENERAL CONFIG TAB */}
            {activeTab === "general" && (
              <form onSubmit={handleSaveConfig} className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Buildings className="h-5 w-5" weight="duotone" />
                    </div>
                    <div>
                      <h2 className="font-display text-base font-bold text-slate-900">Informasi Perusahaan</h2>
                      <p className="text-xs text-slate-500">Identitas hosting yang tercantum pada invoice dan email klien</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nama Perusahaan / Brand
                      </label>
                      <input
                        type="text"
                        required
                        value={config.company_name}
                        onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                        style={{ colorScheme: "light" }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Support Email
                        </label>
                        <input
                          type="email"
                          required
                          value={config.support_email}
                          onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
                          style={{ colorScheme: "light" }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          No. Telepon / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={config.company_phone}
                          onChange={(e) => setConfig({ ...config, company_phone: e.target.value })}
                          style={{ colorScheme: "light" }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Alamat Kantor
                      </label>
                      <input
                        type="text"
                        value={config.company_address}
                        onChange={(e) => setConfig({ ...config, company_address: e.target.value })}
                        style={{ colorScheme: "light" }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Mata Uang Utama
                      </label>
                      <select
                        value={config.default_currency}
                        onChange={(e) => setConfig({ ...config, default_currency: e.target.value })}
                        style={{ colorScheme: "light" }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="IDR (Rupiah)">IDR (Rupiah)</option>
                        <option value="USD (Dollar)">USD (Dollar)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="pb-4 border-b border-slate-100 mb-6">
                    <h2 className="font-display text-base font-bold text-slate-900">Aturan Otomasi Layanan</h2>
                    <p className="text-xs text-slate-500">Kebijakan suspensi dan terminasi akun klien yang menunggak</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Auto Suspend Overdue Accounts</p>
                        <p className="text-xs text-slate-500">Nonaktifkan sementara cPanel/hosting setelah X hari jatuh tempo.</p>
                      </div>
                      <select
                        value={config.auto_suspend_days}
                        onChange={(e) => setConfig({ ...config, auto_suspend_days: parseInt(e.target.value) })}
                        style={{ colorScheme: "light" }}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value={1}>1 Hari</option>
                        <option value={3}>3 Hari (Standar)</option>
                        <option value={7}>7 Hari</option>
                        <option value={14}>14 Hari</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Auto Terminate Overdue Accounts</p>
                        <p className="text-xs text-slate-500">Hapus permanen container & database akun setelah X hari tidak dibayar.</p>
                      </div>
                      <select
                        value={config.auto_terminate_days}
                        onChange={(e) => setConfig({ ...config, auto_terminate_days: parseInt(e.target.value) })}
                        style={{ colorScheme: "light" }}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value={15}>15 Hari</option>
                        <option value={30}>30 Hari (Standar)</option>
                        <option value={60}>60 Hari</option>
                        <option value={90}>90 Hari</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* 2. API CREDENTIALS TAB */}
            {activeTab === "api" && (
              <form onSubmit={handleSaveConfig} className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div>
                      <h2 className="font-display text-base font-bold text-slate-900">Payment Gateway (Midtrans)</h2>
                      <p className="text-xs text-slate-500">Dibutuhkan untuk auto-konfirmasi pembayaran Virtual Account, QRIS, & Kartu Kredit</p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-bold border border-emerald-200">
                      Snap API Ready
                    </span>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Environment Midtrans
                      </label>
                      <select
                        value={config.midtrans_environment}
                        onChange={(e) => setConfig({ ...config, midtrans_environment: e.target.value })}
                        style={{ colorScheme: "light" }}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                      >
                        <option value="Sandbox">Sandbox (Testing / Uji Coba)</option>
                        <option value="Production">Production (Live Transaksi Riil)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Server Key
                      </label>
                      <div className="relative">
                        <input
                          type={showMidtransServerKey ? "text" : "password"}
                          value={config.midtrans_server_key}
                          onChange={(e) => setConfig({ ...config, midtrans_server_key: e.target.value })}
                          placeholder="SB-Mid-server-xxxxxxxxxxxx"
                          style={{ colorScheme: "light" }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-mono text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowMidtransServerKey(!showMidtransServerKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          {showMidtransServerKey ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Client Key
                      </label>
                      <input
                        type="text"
                        value={config.midtrans_client_key}
                        onChange={(e) => setConfig({ ...config, midtrans_client_key: e.target.value })}
                        placeholder="SB-Mid-client-xxxxxxxxxxxx"
                        style={{ colorScheme: "light" }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div>
                      <h2 className="font-display text-base font-bold text-slate-900">Domain Registrar (ResellerClub)</h2>
                      <p className="text-xs text-slate-500">Penyedia pendaftaran dan aktivasi nama domain instan</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Reseller ID
                      </label>
                      <input
                        type="text"
                        value={config.reseller_club_id}
                        onChange={(e) => setConfig({ ...config, reseller_club_id: e.target.value })}
                        placeholder="555432"
                        style={{ colorScheme: "light" }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showResellerApiKey ? "text" : "password"}
                          value={config.reseller_club_api_key}
                          onChange={(e) => setConfig({ ...config, reseller_club_api_key: e.target.value })}
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          style={{ colorScheme: "light" }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-mono text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowResellerApiKey(!showResellerApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          {showResellerApiKey ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* 3. WEBHOOKS TAB */}
            {activeTab === "webhooks" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">Webhook Endpoints</h2>
                    <p className="text-xs text-slate-500">Notifikasi otomatis real-time ke sistem luar (Discord, Slack, n8n, Zapier)</p>
                  </div>
                  <button
                    onClick={() => setIsWebhookModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" weight="bold" />
                    <span>Tambah Webhook</span>
                  </button>
                </div>

                {webhooks.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <LinkSimple className="mx-auto h-12 w-12 text-slate-300 mb-3" weight="duotone" />
                    <p className="font-semibold text-slate-700">Belum ada webhook terdaftar</p>
                    <p className="text-xs text-slate-400 mt-1">Daftarkan endpoint URL webhook untuk menerima event sistem</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {webhooks.map((wh) => (
                      <div key={wh.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-bold text-slate-900 text-sm">{wh.name}</h3>
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </div>
                          <p className="font-mono text-xs text-slate-600 truncate max-w-xl">{wh.url}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-slate-400 font-medium">Events:</span>
                            {wh.events.split(",").map((ev, i) => (
                              <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700">
                                {ev.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setDeleteConfirmWebhook(wh)}
                            className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Hapus Webhook"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. STAFF & RBAC TAB */}
            {activeTab === "staff" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">Staff Members & RBAC</h2>
                    <p className="text-xs text-slate-500">Kelola anggota tim internal dan penetapan hak akses administratif</p>
                  </div>
                  <button
                    onClick={() => setIsStaffModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" weight="bold" />
                    <span>Tambah Staff</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Nama & Email</th>
                        <th className="px-6 py-4 font-semibold">Role Akses</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffList.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase">
                                {member.name ? member.name.charAt(0) : "S"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{member.name}</p>
                                <p className="text-xs text-slate-400">{member.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadge(member.role)}`}>
                              {getRoleLabel(member.role)}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                member.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {member.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            {member.id === 1 || member.email === "admin@kioshosting.id" ? (
                              <span className="text-xs font-semibold text-slate-400 italic">Owner (Protected)</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingStaff({ ...member })}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  Edit Role
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmStaff(member)}
                                  className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                                  title="Hapus Staff"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODAL TAMBAH WEBHOOK ===================== */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
                  <LinkSimple className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tambah Webhook Endpoint</h3>
                  <p className="text-xs text-slate-500">Kirim HTTP POST saat event terjadi</p>
                </div>
              </div>
              <button
                onClick={() => setIsWebhookModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Webhook
                </label>
                <input
                  type="text"
                  required
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                  placeholder="cth. Telegram Notifier / Discord Billing"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Payload URL
                </label>
                <input
                  type="url"
                  required
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                  placeholder="https://example.com/api/webhooks"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Events Trigger (dipisah koma)
                </label>
                <input
                  type="text"
                  value={webhookForm.events}
                  onChange={(e) => setWebhookForm({ ...webhookForm, events: e.target.value })}
                  placeholder="invoice.paid,ticket.opened,client.registered"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Secret Key (Opsional)
                </label>
                <input
                  type="text"
                  value={webhookForm.secret_key}
                  onChange={(e) => setWebhookForm({ ...webhookForm, secret_key: e.target.value })}
                  placeholder="whsec_xxxxxxxxxxxxxxxxxxxx"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm transition-all"
                >
                  {saving && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <span>Simpan Webhook</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL TAMBAH STAFF ===================== */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tambah Anggota Staff</h3>
                  <p className="text-xs text-slate-500">Berikan akses panel admin sesuai tugas staf</p>
                </div>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="cth. CS Rina"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Login
                </label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="staff@kioshosting.id"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi Sementara
                </label>
                <input
                  type="password"
                  required
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Role Akses (RBAC)
                </label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="support_agent">Support Agent (Tiket & Bantuan Klien)</option>
                  <option value="billing_admin">Billing Admin (Invoice & Keuangan)</option>
                  <option value="superadmin">Superadmin (Akses Penuh Sistem)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all"
                >
                  {saving && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <span>Tambah Staff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL EDIT STAFF ===================== */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <PencilSimple className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit Akses Staff</h3>
                  <p className="text-xs text-slate-500">{editingStaff.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaffRole} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Staff
                </label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Role Akses
                </label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="support_agent">Support Agent</option>
                  <option value="billing_admin">Billing Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Status Akun
                </label>
                <select
                  value={editingStaff.status}
                  onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="active">Active (Dapat Login)</option>
                  <option value="suspended">Suspended (Ditangguhkan)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all"
                >
                  {saving && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL KONFIRMASI HAPUS STAFF ===================== */}
      {deleteConfirmStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <Trash className="h-6 w-6" weight="bold" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Hapus Akses Staff?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus akun staff{" "}
              <strong className="text-slate-900">{deleteConfirmStaff.name}</strong> ({deleteConfirmStaff.email})?
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmStaff(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleDeleteStaff}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {saving && <CircleNotch className="h-4 w-4 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL KONFIRMASI HAPUS WEBHOOK ===================== */}
      {deleteConfirmWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <Trash className="h-6 w-6" weight="bold" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Hapus Webhook?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Hapus endpoint webhook <strong className="text-slate-900">{deleteConfirmWebhook.name}</strong>?
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmWebhook(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleDeleteWebhook}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {saving && <CircleNotch className="h-4 w-4 animate-spin" />}
                <span>Ya, Hapus Webhook</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
