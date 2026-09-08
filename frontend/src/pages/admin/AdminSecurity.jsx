import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldWarning,
  Prohibit,
  Globe,
  Cloud,
  CheckCircle,
  Warning,
  X,
  CircleNotch,
  Plus,
  ArrowClockwise,
  MagnifyingGlass,
  Funnel,
  CaretLeft,
  CaretRight,
  Lightning,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { api } from "../../lib/auth";

export default function AdminSecurity() {
  const [overview, setOverview] = useState({
    system_status: "Protected",
    total_blocked: 0,
    active_threats: 0,
    under_attack_mode: false,
    cf_status: "Synced",
    cf_cache_cleared_at: "",
    waf_mode: "High",
  });

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [attackLoading, setAttackLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 8;

  // Modals
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [unbanTarget, setUnbanTarget] = useState(null);
  const [banForm, setBanForm] = useState({
    ip: "",
    reason: "SSH Brute Force",
    customReason: "",
    node: "JKT-01",
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
      const data = await api("GET", "/admin/security/overview");
      setOverview(data);
    } catch (err) {
      console.error("Gagal memuat overview security:", err);
    }
  }

  // Load Blocked IPs with search & pagination
  async function loadBlockedIPs(currentPage = page, currentSearch = search, currentSource = sourceFilter) {
    setTableLoading(true);
    try {
      let query = `/admin/security/blocked-ips?page=${currentPage}&limit=${limit}`;
      if (currentSearch.trim()) {
        query += `&search=${encodeURIComponent(currentSearch.trim())}`;
      }
      if (currentSource && currentSource !== "All") {
        query += `&source=${encodeURIComponent(currentSource)}`;
      }

      const res = await api("GET", query);
      setBlocks(Array.isArray(res.data) ? res.data : []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error("Gagal memuat daftar blocked IPs:", err);
      showToast("error", "Gagal memuat log IP yang diblokir.");
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
    loadBlockedIPs(1, search, sourceFilter);
  }, []);

  // Debounce search / filter update
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadBlockedIPs(1, search, sourceFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sourceFilter]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadBlockedIPs(newPage, search, sourceFilter);
  };

  // --- ACTIONS ---

  // 1. Clear Cloudflare Cache
  const handleClearCFCache = async () => {
    setCacheLoading(true);
    try {
      const res = await api("POST", "/admin/security/cf-cache-clear");
      showToast("success", res.message || "Cache Cloudflare berhasil dibersihkan.");
      loadOverview();
    } catch (err) {
      showToast("error", err.message || "Gagal membersihkan cache Cloudflare.");
    } finally {
      setCacheLoading(false);
    }
  };

  // 2. Toggle Under Attack Mode
  const handleToggleUnderAttack = async () => {
    setAttackLoading(true);
    try {
      const res = await api("PUT", "/admin/security/toggle-under-attack");
      showToast("success", res.message);
      setOverview((prev) => ({
        ...prev,
        under_attack_mode: res.under_attack_mode,
        system_status: res.under_attack_mode ? "Under Attack Mode Active" : "Protected",
      }));
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah mode Under Attack.");
    } finally {
      setAttackLoading(false);
    }
  };

  // 3. Ban IP
  const handleOpenBanModal = () => {
    setBanForm({
      ip: "",
      reason: "SSH Brute Force",
      customReason: "",
      node: "JKT-01",
    });
    setIsBanModalOpen(true);
  };

  const handleSaveBanIP = async (e) => {
    e.preventDefault();
    const finalReason =
      banForm.reason === "Lainnya" ? banForm.customReason.trim() : banForm.reason;

    if (!banForm.ip.trim()) {
      showToast("error", "Alamat IP wajib diisi.");
      return;
    }
    if (!finalReason) {
      showToast("error", "Alasan pemblokiran wajib diisi.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api("POST", "/admin/security/ban-ip", {
        ip: banForm.ip.trim(),
        reason: finalReason,
        source: "Manual Admin",
        node: banForm.node,
      });

      showToast("success", res.message || "IP berhasil diblokir!");
      setIsBanModalOpen(false);
      loadOverview();
      loadBlockedIPs(1, search, sourceFilter);
    } catch (err) {
      showToast("error", err.message || "Gagal memblokir IP.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Unban IP
  const handleConfirmUnban = async () => {
    if (!unbanTarget) return;
    setActionLoading(true);
    try {
      const res = await api("PUT", `/admin/security/unban/${unbanTarget.id}`);
      showToast("success", res.message || `IP ${unbanTarget.ip} berhasil di-unban.`);
      setUnbanTarget(null);
      loadOverview();
      loadBlockedIPs(page, search, sourceFilter);
    } catch (err) {
      showToast("error", err.message || "Gagal membuka blokir IP.");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const getReasonBadgeClass = (reason) => {
    const lower = reason.toLowerCase();
    if (lower.includes("injection") || lower.includes("ddos") || lower.includes("brute force")) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (lower.includes("scan") || lower.includes("probe") || lower.includes("failed login")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

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
          <h1 className="text-2xl font-display font-bold text-slate-900">Security & WAF</h1>
          <p className="text-sm text-slate-500">
            Monitor ancaman real-time, daftar IP terblokir, ModSecurity, dan integrasi Cloudflare Edge
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadOverview();
              loadBlockedIPs(page, search, sourceFilter);
            }}
            title="Refresh Data"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <ArrowClockwise className="h-4 w-4" weight="bold" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenBanModal}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95"
          >
            <Plus className="h-4 w-4" weight="bold" />
            <span>Blokir IP Manual</span>
          </button>
        </div>
      </div>

      {/* Under Attack Mode Emergency Banner */}
      {overview.under_attack_mode && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-5 shadow-lg animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                <Lightning className="h-6 w-6" weight="fill" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-base">
                  Cloudflare Under Attack Mode Sedang AKTIF!
                </h3>
                <p className="text-xs text-red-700 mt-0.5">
                  Setiap pengunjung baru akan diperiksa melalui JavaScript Challenge sebelum diizinkan mengakses website.
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleUnderAttack}
              disabled={attackLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 shadow-sm transition-all disabled:opacity-50"
            >
              {attackLoading ? <CircleNotch className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              <span>Nonaktifkan Mode Darurat</span>
            </button>
          </div>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className={`rounded-2xl border p-5 shadow-sm transition-all ${
            overview.under_attack_mode
              ? "border-red-200 bg-red-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                overview.under_attack_mode
                  ? "bg-red-100 text-red-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              <ShieldCheck className="h-6 w-6" weight="fill" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                System Status
              </p>
              <p
                className={`font-display text-lg font-bold ${
                  overview.under_attack_mode ? "text-red-700" : "text-emerald-800"
                }`}
              >
                {overview.system_status}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Blocked IPs
            </p>
            <Prohibit className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">
            {overview.total_blocked.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-slate-500 mt-1">IP aktif terisolasi dari jaringan</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Threats (24h)
            </p>
            <ShieldWarning className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-red-600">
            {overview.active_threats}
          </p>
          <p className="text-xs text-slate-500 mt-1">Percobaan serangan baru diblokir</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cloudflare Edge
            </p>
            <Cloud className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <p className="font-display text-lg font-bold text-slate-900">{overview.cf_status}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {overview.cf_cache_cleared_at
              ? `Purge: ${overview.cf_cache_cleared_at}`
              : "WAF Rule: High Active"}
          </p>
        </div>
      </div>

      {/* Main Grid: Table & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Table Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Table Header & Controls */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Recent Blocked Activity
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar alamat IP yang dihentikan oleh firewall secara otomatis maupun manual
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari IP, alasan, node..."
                    style={{ colorScheme: "light" }}
                    className="w-48 sm:w-56 rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="relative">
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    style={{ colorScheme: "light" }}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="All">Semua Source</option>
                    <option value="Fail2ban">Fail2ban</option>
                    <option value="ModSecurity">ModSecurity</option>
                    <option value="Cloudflare">Cloudflare</option>
                    <option value="Manual Admin">Manual Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">IP Address</th>
                    <th className="px-5 py-3.5 font-semibold">Reason / Threat</th>
                    <th className="px-5 py-3.5 font-semibold">Source / Node</th>
                    <th className="px-5 py-3.5 font-semibold">Waktu Blokir</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <CircleNotch className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                        <span className="text-xs font-medium">Memuat log keamanan...</span>
                      </td>
                    </tr>
                  ) : blocks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <p className="font-semibold text-slate-800">Tidak ada IP terblokir</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Semua request jaringan aman atau belum ada data yang cocok dengan filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    blocks.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                            {b.ip}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${getReasonBadgeClass(
                              b.reason
                            )}`}
                          >
                            <ShieldWarning className="h-3.5 w-3.5 shrink-0" weight="bold" />
                            {b.reason}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900 text-xs">{b.source}</div>
                          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
                            {b.node}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(b.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setUnbanTarget(b)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <span>Unban</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {!tableLoading && totalCount > 0 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Menampilkan{" "}
                  <strong className="text-slate-900">
                    {(page - 1) * limit + 1}-{Math.min(page * limit, totalCount)}
                  </strong>{" "}
                  dari <strong className="text-slate-900">{totalCount}</strong> IP
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CaretLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2 font-medium text-slate-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CaretRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-base font-bold text-slate-900 mb-1">
              Quick Security Controls
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Aksi langsung terhadap firewall & konfigurasi proxy Cloudflare
            </p>

            <div className="space-y-3">
              {/* Ban IP */}
              <button
                onClick={handleOpenBanModal}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:bg-slate-50 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:scale-105 transition-transform">
                    <Prohibit className="h-5 w-5" weight="bold" />
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-900 text-sm">
                      Ban IP Address
                    </span>
                    <span className="block text-xs text-slate-400">
                      Blokir manual akses IP ke semua node
                    </span>
                  </div>
                </div>
                <Plus className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
              </button>

              {/* Clear Cloudflare Cache */}
              <button
                onClick={handleClearCFCache}
                disabled={cacheLoading}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:bg-slate-50 group text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:scale-105 transition-transform">
                    {cacheLoading ? (
                      <CircleNotch className="h-5 w-5 animate-spin" />
                    ) : (
                      <Cloud className="h-5 w-5" weight="bold" />
                    )}
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-900 text-sm">
                      Purge Cloudflare Cache
                    </span>
                    <span className="block text-xs text-slate-400">
                      Bersihkan seluruh edge cache global
                    </span>
                  </div>
                </div>
                <ArrowsClockwise
                  className={`h-4 w-4 text-slate-400 group-hover:text-slate-700 ${
                    cacheLoading ? "animate-spin" : ""
                  }`}
                />
              </button>

              {/* Toggle Under Attack Mode */}
              <button
                onClick={handleToggleUnderAttack}
                disabled={attackLoading}
                className={`flex w-full items-center justify-between rounded-xl border p-4 transition-all group text-left disabled:opacity-50 ${
                  overview.under_attack_mode
                    ? "border-red-300 bg-red-50/50 hover:bg-red-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform ${
                      overview.under_attack_mode
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-blue-50 text-blue-600 group-hover:scale-105"
                    }`}
                  >
                    {attackLoading ? (
                      <CircleNotch className="h-5 w-5 animate-spin" />
                    ) : (
                      <Globe className="h-5 w-5" weight="bold" />
                    )}
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-900 text-sm">
                      {overview.under_attack_mode ? "Disable Under Attack" : "Enable Under Attack"}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {overview.under_attack_mode ? "Sedang aktif (JS Challenge)" : "Mode darurat saat ada DDoS"}
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    overview.under_attack_mode
                      ? "bg-red-200 text-red-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {overview.under_attack_mode ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          {/* Firewall Security Rules Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" weight="fill" />
              <h3 className="font-bold text-slate-900 text-sm">Automated Defense Rules</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center justify-between">
                <span>Fail2ban SSH Threshold:</span>
                <strong className="text-slate-900">5 fails / 10 min</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>ModSecurity CRS:</span>
                <strong className="text-emerald-700">OWASP CRS v3.3 Active</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>Rate Limiting per IP:</span>
                <strong className="text-slate-900">120 req / minute</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>Automatic Ban Duration:</span>
                <strong className="text-slate-900">24 Jam</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===================== MODALS ===================== */}

      {/* 1. Modal Ban IP Manual */}
      {isBanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
                  <Prohibit className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Blokir Alamat IP</h3>
                  <p className="text-xs text-slate-500">Tambahkan IP ke blacklist firewall server</p>
                </div>
              </div>
              <button
                onClick={() => setIsBanModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanIP} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Alamat IP (IPv4 / IPv6)
                </label>
                <input
                  type="text"
                  required
                  value={banForm.ip}
                  onChange={(e) => setBanForm({ ...banForm, ip: e.target.value })}
                  placeholder="cth. 103.111.222.33"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Alasan Pemblokiran
                </label>
                <select
                  value={banForm.reason}
                  onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                >
                  <option value="SSH Brute Force">SSH Brute Force</option>
                  <option value="SQL Injection Attempt">SQL Injection Attempt</option>
                  <option value="Multiple Failed Logins">Multiple Failed Logins</option>
                  <option value="DDoS Layer 7 HTTP Flood">DDoS Layer 7 HTTP Flood</option>
                  <option value="Port Scanning & Probe">Port Scanning & Probe</option>
                  <option value="Spamming & Web Scraping">Spamming & Web Scraping</option>
                  <option value="Lainnya">Lainnya (Tulis Sendiri)</option>
                </select>
              </div>

              {banForm.reason === "Lainnya" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Detail Alasan Blokir
                  </label>
                  <input
                    type="text"
                    required
                    value={banForm.customReason}
                    onChange={(e) => setBanForm({ ...banForm, customReason: e.target.value })}
                    placeholder="cth. Penyalahgunaan API Endpoint"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Node Server
                </label>
                <select
                  value={banForm.node}
                  onChange={(e) => setBanForm({ ...banForm, node: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                >
                  <option value="Global">Global (Semua Server & Edge Node)</option>
                  <option value="JKT-01">JKT-01 (Jakarta Tier-3)</option>
                  <option value="JKT-02">JKT-02 (Jakarta Cyber)</option>
                  <option value="SGP-01">SGP-01 (Singapore Equinix)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBanModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all"
                >
                  {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <span>Blokir Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Konfirmasi Unban */}
      {unbanTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-4">
              <ShieldCheck className="h-6 w-6" weight="bold" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Buka Blokir IP?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Apakah Anda yakin ingin mencabut pemblokiran untuk alamat IP{" "}
              <strong className="font-mono text-slate-900 font-bold">{unbanTarget.ip}</strong>?
            </p>
            <p className="mt-1 text-xs text-slate-400">
              IP ini akan kembali diizinkan mengakses website dan seluruh layanan hosting.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setUnbanTarget(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmUnban}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                <span>Ya, Buka Blokir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
