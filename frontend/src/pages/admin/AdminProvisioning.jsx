import React, { useState, useEffect } from "react";
import {
  Cpu,
  HardDrives,
  CheckCircle,
  XCircle,
  WarningCircle,
  ArrowsClockwise,
  Plus,
  MagnifyingGlass,
  Funnel,
  ArrowSquareOut,
  Lock,
  LockOpen,
  Trash,
  ShieldCheck,
  Pulse,
  Lightning,
  Gear,
  CircleNotch,
  FileText,
  Clock,
  CaretRight,
  Database,
  CloudCheck,
} from "@phosphor-icons/react";
import { api } from "../../lib/auth";

export default function AdminProvisioning() {
  const [activeTab, setActiveTab] = useState("services"); // "services" | "servers" | "logs"
  const [stats, setStats] = useState({
    total_services: 0,
    active_services: 0,
    suspended_services: 0,
    pending_services: 0,
    terminated_services: 0,
    total_servers: 0,
    total_capacity: 0,
    total_allocated: 0,
    capacity_percent: 0,
  });
  const [services, setServices] = useState([]);
  const [servers, setServers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters & Pagination for Services
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [showManualProvisionModal, setShowManualProvisionModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(null); // service object
  const [suspendReason, setSuspendReason] = useState("");
  const [testResult, setTestResult] = useState(null);

  // Form state: Add Server
  const [serverForm, setServerForm] = useState({
    name: "",
    type: "whm",
    host: "",
    ip: "",
    port: 2087,
    api_token: "",
    max_accounts: 250,
    nameserver1: "ns1.kioshosting.id",
    nameserver2: "ns2.kioshosting.id",
  });

  // Clients & Plans for Manual Provision
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [manualForm, setManualForm] = useState({
    user_id: "",
    plan_id: "",
    server_id: "",
    domain: "",
    billing_cycle: "monthly",
    auto_provision: true,
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOverview = async () => {
    try {
      const res = await api.get("/api/v1/admin/provisioning/overview");
      if (res && res.stats) setStats(res.stats);
    } catch (err) {
      console.error("Error fetching overview stats:", err);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/v1/admin/provisioning/services?page=${page}&limit=12&status=${statusFilter}&search=${encodeURIComponent(
          search
        )}`
      );
      if (res && res.data) {
        setServices(res.data);
        setTotalPages(res.total_pages || 1);
      }
    } catch (err) {
      console.error("Error fetching user services:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServers = async () => {
    try {
      const res = await api.get("/api/v1/admin/provisioning/servers");
      if (res && res.data) setServers(res.data);
    } catch (err) {
      console.error("Error fetching server connectors:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get("/api/v1/admin/provisioning/logs?limit=30");
      if (res && res.data) setLogs(res.data);
    } catch (err) {
      console.error("Error fetching provisioning logs:", err);
    }
  };

  const fetchFormPrerequisites = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        api.get("/api/v1/admin/clients?limit=50"),
        api.get("/api/v1/admin/products/plans"),
      ]);
      if (cRes && cRes.data) setClients(cRes.data);
      if (pRes && pRes.data) setPlans(pRes.data);
    } catch (err) {
      console.error("Error fetching form requirements:", err);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchServices();
    fetchServers();
    fetchLogs();
    fetchFormPrerequisites();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  // Lifecycle Action Handlers
  const handleServiceAction = async (serviceId, action, reason = "") => {
    setActionLoading(`${serviceId}-${action}`);
    try {
      const res = await api.post(`/api/v1/admin/provisioning/services/${serviceId}/action`, {
        action,
        reason,
      });
      showToast(res.message || `Aksi ${action} berhasil dieksekusi!`);
      fetchServices();
      fetchOverview();
      fetchLogs();
    } catch (err) {
      showToast(err.response?.data?.message || `Gagal mengeksekusi ${action}`, "error");
    } finally {
      setActionLoading(null);
      setShowSuspendModal(null);
      setSuspendReason("");
    }
  };

  const handleTestServer = async (serverId) => {
    setActionLoading(`test-${serverId}`);
    setTestResult(null);
    try {
      const res = await api.post(`/api/v1/admin/provisioning/servers/${serverId}/test`);
      setTestResult({
        serverId,
        success: true,
        message: res.message,
        latency: res.latency_ms,
        version: res.version_info,
      });
      showToast(res.message);
      fetchServers();
    } catch (err) {
      setTestResult({
        serverId,
        success: false,
        message: err.response?.data?.message || "Koneksi gagal",
      });
      showToast("Gagal terhubung ke remote server", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateServer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/v1/admin/provisioning/servers", {
        ...serverForm,
        port: parseInt(serverForm.port, 10),
        max_accounts: parseInt(serverForm.max_accounts, 10),
      });
      showToast(res.message || "Server connector berhasil ditambahkan");
      setShowAddServerModal(false);
      setServerForm({
        name: "",
        type: "whm",
        host: "",
        ip: "",
        port: 2087,
        api_token: "",
        max_accounts: 250,
        nameserver1: "ns1.kioshosting.id",
        nameserver2: "ns2.kioshosting.id",
      });
      fetchServers();
      fetchOverview();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambahkan server", "error");
    }
  };

  const handleManualProvision = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/v1/admin/provisioning/services", {
        user_id: parseInt(manualForm.user_id, 10),
        plan_id: parseInt(manualForm.plan_id, 10),
        server_id: parseInt(manualForm.server_id, 10),
        domain: manualForm.domain,
        billing_cycle: manualForm.billing_cycle,
        auto_provision: manualForm.auto_provision,
      });
      showToast(res.message || "Layanan berhasil dibuat & di-provision!");
      setShowManualProvisionModal(false);
      setManualForm({
        user_id: "",
        plan_id: "",
        server_id: "",
        domain: "",
        billing_cycle: "monthly",
        auto_provision: true,
      });
      fetchServices();
      fetchOverview();
      fetchLogs();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal membuat layanan", "error");
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "error"
              ? "bg-rose-950/90 text-rose-100 border-rose-700/50 backdrop-blur-md"
              : "bg-slate-900/95 text-white border-emerald-500/30 backdrop-blur-md"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle weight="fill" className="h-5 w-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle weight="fill" className="h-5 w-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-7 text-white shadow-xl border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Cpu weight="duotone" className="h-4 w-4 text-blue-400" />
              Automated Infrastructure Orchestrator
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-display">
              Auto-Provisioning Server Module
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Integrasi API langsung ke control panel hosting (cPanel/WHM, CyberPanel) dan hypervisor (Proxmox KVM).
              Aktivasi instan saat invoice berstatus PAID, manajemen quota, serta kontrol lifecycle server terpusat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddServerModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm border border-slate-600/70 transition-all hover:border-slate-500"
            >
              <Plus weight="bold" className="h-4 w-4" />
              Tambah Server Panel
            </button>
            <button
              onClick={() => setShowManualProvisionModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <CloudCheck weight="bold" className="h-4 w-4" />
              Manual Provisioning
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Layanan Aktif</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CloudCheck weight="duotone" className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-display">
              {stats.active_services}
            </span>
            <span className="text-xs text-slate-500">
              dari {stats.total_services} total akun
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              {stats.suspended_services} Suspended
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              {stats.pending_services} Pending
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Server Terhubung</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Database weight="duotone" className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-display">
              {stats.total_servers}
            </span>
            <span className="text-xs text-emerald-600 font-medium">100% Online</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100 truncate">
            WHM, Proxmox VE, & CyberPanel Nodes
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Densitas Akun Server</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <HardDrives weight="duotone" className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-display">
              {stats.capacity_percent}%
            </span>
            <span className="text-xs text-slate-500">
              {stats.total_allocated} / {stats.total_capacity} Akun
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.capacity_percent > 85 ? "bg-rose-500" : stats.capacity_percent > 65 ? "bg-amber-500" : "bg-indigo-600"
              }`}
              style={{ width: `${Math.min(stats.capacity_percent, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Otomasi Aktivasi</span>
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <Lightning weight="duotone" className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-display">
              {stats.avg_latency_ms ? `${stats.avg_latency_ms} ms` : "< 1.5 dtk"}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Instan</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
            Aktif 24/7 Tanpa Intervensi Manual
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "services"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <HardDrives weight={activeTab === "services" ? "fill" : "duotone"} className="h-4 w-4" />
          Akun Layanan & Kontainer ({stats.total_services})
        </button>

        <button
          onClick={() => setActiveTab("servers")}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "servers"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Database weight={activeTab === "servers" ? "fill" : "duotone"} className="h-4 w-4" />
          Konektor Node Server ({servers.length})
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "logs"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText weight={activeTab === "logs" ? "fill" : "duotone"} className="h-4 w-4" />
          Audit Log Provisioning
        </button>
      </div>

      {/* TAB 1: User Services Table */}
      {activeTab === "services" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari domain, username, atau client..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </form>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                {["all", "active", "suspended", "pending", "terminated"].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                      statusFilter === st
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {st === "all" ? "Semua Status" : st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  fetchServices();
                  fetchOverview();
                }}
                title="Refresh"
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                <ArrowsClockwise weight="bold" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Domain & Client</th>
                  <th className="py-3 px-4">Server Node</th>
                  <th className="py-3 px-4">Username & IP</th>
                  <th className="py-3 px-4">Penggunaan Storage</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <CircleNotch className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
                      Memuat daftar layanan...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Tidak ada layanan hosting yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {svc.domain}
                          <a
                            href={`https://${svc.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-blue-600"
                          >
                            <ArrowSquareOut className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {svc.client?.Name || "Client"} • {svc.plan?.name || "Paket Hosting"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          <Database className="h-3 w-3 text-slate-500" />
                          {svc.server?.name || "WHM Primary"}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {svc.server?.host}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-800 font-medium">{svc.username}</span>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {svc.ip_address || "103.189.234.10"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                          <span>{svc.disk_usage_mb} MB</span>
                          <span className="text-slate-400">/ {svc.disk_limit_mb} MB</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              svc.disk_usage_mb / svc.disk_limit_mb > 0.85
                                ? "bg-rose-500"
                                : "bg-blue-600"
                            }`}
                            style={{
                              width: `${Math.min(
                                Math.round((svc.disk_usage_mb / (svc.disk_limit_mb || 1)) * 100),
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium">
                          {new Date(svc.next_due_date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {svc.billing_cycle}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {svc.status === "active" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        )}
                        {svc.status === "suspended" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <WarningCircle weight="fill" className="h-3.5 w-3.5 text-amber-500" />
                            Suspended
                          </span>
                        )}
                        {svc.status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            Pending
                          </span>
                        )}
                        {svc.status === "terminated" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle weight="fill" className="h-3.5 w-3.5 text-rose-500" />
                            Terminated
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {svc.status === "pending" && (
                            <button
                              onClick={() => handleServiceAction(svc.id, "provision")}
                              disabled={actionLoading === `${svc.id}-provision`}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-all flex items-center gap-1"
                            >
                              {actionLoading === `${svc.id}-provision` ? (
                                <CircleNotch className="h-3 w-3 animate-spin" />
                              ) : (
                                <CloudCheck weight="bold" className="h-3 w-3" />
                              )}
                              Provision Now
                            </button>
                          )}

                          {svc.status === "active" && (
                            <>
                              <button
                                onClick={() => handleServiceAction(svc.id, "sync")}
                                disabled={actionLoading === `${svc.id}-sync`}
                                title="Sync Usage Metrics"
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all"
                              >
                                {actionLoading === `${svc.id}-sync` ? (
                                  <CircleNotch className="h-3.5 w-3.5 animate-spin text-blue-600" />
                                ) : (
                                  <ArrowsClockwise className="h-3.5 w-3.5" />
                                )}
                              </button>

                              <button
                                onClick={() => setShowSuspendModal(svc)}
                                title="Suspend Account"
                                className="p-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 text-amber-600 transition-all"
                              >
                                <Lock className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}

                          {svc.status === "suspended" && (
                            <button
                              onClick={() => handleServiceAction(svc.id, "unsuspend")}
                              disabled={actionLoading === `${svc.id}-unsuspend`}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-all flex items-center gap-1"
                            >
                              {actionLoading === `${svc.id}-unsuspend` ? (
                                <CircleNotch className="h-3 w-3 animate-spin" />
                              ) : (
                                <LockOpen weight="bold" className="h-3 w-3" />
                              )}
                              Unsuspend
                            </button>
                          )}

                          {svc.status !== "terminated" && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Apakah Anda yakin ingin men-terminate layanan ${svc.domain}? Akun dan seluruh data akan dihapus permanen dari server.`
                                  )
                                ) {
                                  handleServiceAction(svc.id, "terminate");
                                }
                              }}
                              disabled={actionLoading === `${svc.id}-terminate`}
                              title="Terminate Service"
                              className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-all"
                            >
                              {actionLoading === `${svc.id}-terminate` ? (
                                <CircleNotch className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Halaman {page} dari {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Server Connectors */}
      {activeTab === "servers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {servers.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5 ${
                        srv.type === "proxmox"
                          ? "bg-amber-100 text-amber-800"
                          : srv.type === "cyberpanel"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {srv.type.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{srv.name}</h3>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Connected
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3 text-slate-600 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Endpoint:</span>
                    <span className="font-medium text-slate-800">{srv.host}:{srv.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Server IP:</span>
                    <span className="text-slate-800">{srv.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">SSL Encrypted:</span>
                    <span className="text-emerald-600 font-sans font-medium">
                      {srv.use_ssl ? "Ya (TLS 1.3)" : "Tidak"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Nameservers:</span>
                    <span className="text-slate-700">{srv.nameserver1}</span>
                  </div>
                </div>

                {/* Account Density */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Kapasitas Akun</span>
                    <span className="font-bold text-slate-800">
                      {srv.active_accounts} / {srv.max_accounts}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        srv.active_accounts / srv.max_accounts > 0.8
                          ? "bg-rose-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.round((srv.active_accounts / (srv.max_accounts || 1)) * 100),
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTestServer(srv.id)}
                  disabled={actionLoading === `test-${srv.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  {actionLoading === `test-${srv.id}` ? (
                    <CircleNotch className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  ) : (
                    <Pulse weight="bold" className="h-3.5 w-3.5 text-slate-500" />
                  )}
                  Test Koneksi API
                </button>

                <a
                  href={`https://${srv.host}:${srv.port}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all"
                  title="Buka Control Panel"
                >
                  <ArrowSquareOut className="h-4 w-4" />
                </a>
              </div>

              {/* Test Result Callout */}
              {testResult && testResult.serverId === srv.id && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                    <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600" />
                    Handshake Sukses ({testResult.latency}ms)
                  </div>
                  <div className="text-slate-500 font-mono text-[10px]">
                    {testResult.version}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Audit Logs */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Eksekusi Auto-Provisioning</h3>
              <p className="text-xs text-slate-500">Log operasional API handshake, pembuatan akun, dan lifecycle event</p>
            </div>
            <button
              onClick={fetchLogs}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowsClockwise weight="bold" className="h-3.5 w-3.5" />
              Refresh Log
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">Belum ada riwayat audit log.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3.5">
                  <div
                    className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center ${
                      log.status === "SUCCESS"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                        : "bg-rose-50 text-rose-600 border border-rose-200/60"
                    }`}
                  >
                    {log.status === "SUCCESS" ? (
                      <CheckCircle weight="bold" className="h-4 w-4" />
                    ) : (
                      <XCircle weight="bold" className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {log.action}
                        </span>
                        <span className="font-semibold text-slate-900">{log.target_domain}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-mono">{log.latency_ms}ms</span>
                        <span>•</span>
                        <span>{new Date(log.created_at).toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: Suspend Account with Reason */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock weight="bold" className="h-5 w-5 text-amber-500" />
              Suspend Akun Hosting
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Akun <strong className="text-slate-800">{showSuspendModal.domain}</strong> akan dibekukan sementara di control panel server.
            </p>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-slate-700">Alasan Penangguhan / Suspend</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Contoh: Tunggakan tagihan invoice perpanjangan, atau pelanggaran TOS..."
                rows="3"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              ></textarea>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSuspendModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleServiceAction(showSuspendModal.id, "suspend", suspendReason)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm"
              >
                Konfirmasi Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Server Connector */}
      {showAddServerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database weight="duotone" className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Tambah Server Control Panel</h3>
              </div>
              <button
                onClick={() => setShowAddServerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServer} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nama Node Server</label>
                  <input
                    type="text"
                    required
                    value={serverForm.name}
                    onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                    placeholder="misal: WHM-Cluster-02"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Jenis Panel / Hypervisor</label>
                  <select
                    value={serverForm.type}
                    onChange={(e) => setServerForm({ ...serverForm, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  >
                    <option value="whm">cPanel / WHM</option>
                    <option value="proxmox">Proxmox VE (KVM/LXC)</option>
                    <option value="cyberpanel">CyberPanel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Hostname / Domain</label>
                  <input
                    type="text"
                    required
                    value={serverForm.host}
                    onChange={(e) => setServerForm({ ...serverForm, host: e.target.value })}
                    placeholder="whm02.kioshosting.id"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Port API</label>
                  <input
                    type="number"
                    required
                    value={serverForm.port}
                    onChange={(e) => setServerForm({ ...serverForm, port: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Server Public IP</label>
                  <input
                    type="text"
                    required
                    value={serverForm.ip}
                    onChange={(e) => setServerForm({ ...serverForm, ip: e.target.value })}
                    placeholder="103.189.234.11"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Kapasitas Maksimal Akun</label>
                  <input
                    type="number"
                    value={serverForm.max_accounts}
                    onChange={(e) => setServerForm({ ...serverForm, max_accounts: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">API Token / Root Remote Key</label>
                <input
                  type="password"
                  required
                  value={serverForm.api_token}
                  onChange={(e) => setServerForm({ ...serverForm, api_token: e.target.value })}
                  placeholder="whm_api_token_xxxxxxxxxxxx"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nameserver 1</label>
                  <input
                    type="text"
                    value={serverForm.nameserver1}
                    onChange={(e) => setServerForm({ ...serverForm, nameserver1: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nameserver 2</label>
                  <input
                    type="text"
                    value={serverForm.nameserver2}
                    onChange={(e) => setServerForm({ ...serverForm, nameserver2: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddServerModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Simpan Server Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manual Provisioning Service */}
      {showManualProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CloudCheck weight="duotone" className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Manual Provisioning Layanan</h3>
              </div>
              <button
                onClick={() => setShowManualProvisionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleManualProvision} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pilih Klien</label>
                <select
                  required
                  value={manualForm.user_id}
                  onChange={(e) => setManualForm({ ...manualForm, user_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Pilih Akun Klien --</option>
                  {clients.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name} ({cl.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Paket Hosting</label>
                  <select
                    required
                    value={manualForm.plan_id}
                    onChange={(e) => setManualForm({ ...manualForm, plan_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">-- Pilih Paket --</option>
                    {plans.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Target Server Node</label>
                  <select
                    required
                    value={manualForm.server_id}
                    onChange={(e) => setManualForm({ ...manualForm, server_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">-- Pilih Node Server --</option>
                    {servers.map((sr) => (
                      <option key={sr.id} value={sr.id}>
                        {sr.name} ({sr.type.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Domain Utama</label>
                <input
                  type="text"
                  required
                  value={manualForm.domain}
                  onChange={(e) => setManualForm({ ...manualForm, domain: e.target.value })}
                  placeholder="domainklien.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200/60">
                <input
                  type="checkbox"
                  id="auto_provision_check"
                  checked={manualForm.auto_provision}
                  onChange={(e) => setManualForm({ ...manualForm, auto_provision: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="auto_provision_check" className="text-xs text-blue-900 font-medium">
                  Eksekusi auto-provisioning langsung ke server & kirim kredensial
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualProvisionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Proses Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
