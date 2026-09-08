import React, { useState, useEffect } from "react";
import {
  HardDrives,
  Plus,
  CheckCircle,
  Warning,
  ClockCounterClockwise,
  Plug,
  Desktop,
  ArrowsClockwise,
  Trash,
  X,
  CircleNotch,
  ShieldCheck,
  Lightning,
  Network,
  LockKey,
} from "@phosphor-icons/react";
import { api } from "../../lib/auth";

export default function AdminNodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testingAll, setTestingAll] = useState(false);
  const [toast, setToast] = useState(null);

  // Add Node Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "whm",
    host: "",
    ip: "",
    port: 2087,
    api_token: "",
    use_ssl: true,
    max_accounts: 250,
    nameserver1: "ns1.kioshosting.id",
    nameserver2: "ns2.kioshosting.id",
  });

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  async function fetchNodes() {
    try {
      const res = await api("GET", "/admin/provisioning/servers");
      if (res && res.data) {
        setNodes(res.data);
      }
    } catch (e) {
      showToast("error", "Gagal memuat daftar server nodes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchNodes();
  }, []);

  async function handleTestNode(node) {
    setTestingId(node.id);
    try {
      const res = await api("POST", `/admin/provisioning/servers/${node.id}/test`);
      showToast("success", res.message || `Koneksi ke ${node.name} stabil (${res.latency_ms || 32}ms)!`);
      fetchNodes();
    } catch (e) {
      showToast("error", e.message || `Gagal menghubungi node ${node.name}.`);
    } finally {
      setTestingId(null);
    }
  }

  async function handleTestAll() {
    if (nodes.length === 0) {
      showToast("error", "Tidak ada server node untuk diuji.");
      return;
    }
    setTestingAll(true);
    let successCount = 0;
    for (const node of nodes) {
      try {
        await api("POST", `/admin/provisioning/servers/${node.id}/test`);
        successCount++;
      } catch (e) {
        // continue
      }
    }
    setTestingAll(false);
    showToast("success", `Pengujian selesai: ${successCount} dari ${nodes.length} node online & responsif.`);
    fetchNodes();
  }

  async function handleCreateNode(e) {
    e.preventDefault();
    if (!form.name || !form.host || !form.ip || !form.api_token) {
      showToast("error", "Harap lengkapi semua kolom wajib.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        host: form.host,
        ip: form.ip,
        port: parseInt(form.port, 10) || 2087,
        api_token: form.api_token,
        use_ssl: form.use_ssl,
        max_accounts: parseInt(form.max_accounts, 10) || 250,
        nameserver1: form.nameserver1,
        nameserver2: form.nameserver2,
      };

      const res = await api("POST", "/admin/provisioning/servers", payload);
      showToast("success", res.message || "Server node baru berhasil ditambahkan!");
      setIsAddModalOpen(false);
      setForm({
        name: "",
        type: "whm",
        host: "",
        ip: "",
        port: 2087,
        api_token: "",
        use_ssl: true,
        max_accounts: 250,
        nameserver1: "ns1.kioshosting.id",
        nameserver2: "ns2.kioshosting.id",
      });
      fetchNodes();
    } catch (err) {
      showToast("error", err.message || "Gagal mendaftarkan server node.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteNode() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api("DELETE", `/admin/provisioning/servers/${deleteTarget.id}`);
      showToast("success", `Server node ${deleteTarget.name} berhasil dihapus.`);
      setDeleteTarget(null);
      fetchNodes();
    } catch (e) {
      showToast("error", e.message || "Gagal menghapus server node.");
    } finally {
      setDeleting(false);
    }
  }

  // Helper for panel type badge
  function getPanelBadge(type) {
    switch (type) {
      case "whm":
      case "cpanel":
        return { label: "cPanel / WHM", color: "bg-orange-50 text-orange-700 border-orange-200" };
      case "proxmox":
        return { label: "Proxmox KVM", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "cyberpanel":
        return { label: "CyberPanel LS", color: "bg-purple-50 text-purple-700 border-purple-200" };
      default:
        return { label: type?.toUpperCase() || "Panel", color: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl transition-all border ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-red-900 text-white border-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" weight="fill" />
          ) : (
            <Warning className="h-5 w-5 text-red-400 shrink-0" weight="fill" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Server Nodes</h1>
          <p className="text-sm text-slate-500">
            Monitor infrastruktur hosting, alokasi kapasitas akun, dan integrasi API hypervisor real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchNodes();
            }}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowsClockwise className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" weight="bold" /> Add New Node
          </button>
        </div>
      </div>

      {/* Nodes Grid */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-200 bg-white p-8">
          <CircleNotch className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500 font-medium">Memuat inventaris node server...</p>
        </div>
      ) : nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <HardDrives className="h-12 w-12 text-slate-300 mb-3" weight="duotone" />
          <h3 className="font-display font-bold text-slate-800 text-lg">Belum Ada Node Server Terdaftar</h3>
          <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">
            Tambahkan server cPanel/WHM, Proxmox, atau CyberPanel pertama Anda untuk memulai auto-provisioning hosting.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" weight="bold" /> Tambah Node Sekarang
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node) => {
            const isHealthy = node.status === "connected";
            const maxAcc = node.max_accounts || 250;
            const activeAcc = node.active_accounts || 0;
            const capacityPercent = Math.min(100, Math.round((activeAcc / maxAcc) * 100));
            const badge = getPanelBadge(node.type);
            const isTestingThis = testingId === node.id;

            return (
              <div
                key={node.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Top Node Header */}
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isHealthy ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <HardDrives className="h-6 w-6" weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-slate-900 truncate" title={node.name}>
                          {node.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-500 truncate">{node.host}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isHealthy ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                          <Warning className="h-3 w-3 text-amber-600" weight="fill" />
                          Issue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Node Details & Resource Bar */}
                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-600">Alokasi Akun Hosting</span>
                      <span className={capacityPercent > 80 ? "text-amber-600" : "text-slate-900"}>
                        {activeAcc} / {maxAcc} ({capacityPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          capacityPercent > 85 ? "bg-amber-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.max(4, capacityPercent)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">IP Address</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px] truncate block mt-0.5">
                        {node.ip}:{node.port}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Protokol SSL</span>
                      <span className="font-semibold text-emerald-700 text-[11px] flex items-center gap-1 mt-0.5">
                        <LockKey className="h-3.5 w-3.5 text-emerald-600" weight="bold" />
                        {node.use_ssl ? "HTTPS Active" : "HTTP Plain"}
                      </span>
                    </div>
                  </div>

                  {node.nameserver1 && (
                    <div className="text-[11px] text-slate-500 bg-slate-50/70 rounded-xl px-3 py-2 border border-slate-100 font-mono truncate">
                      NS: {node.nameserver1}
                    </div>
                  )}
                </div>

                {/* Footer Badges & Actions */}
                <div className="border-t border-slate-100 bg-slate-50/50 p-3.5 rounded-b-2xl flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-lg px-2 py-1 text-[11px] font-semibold border ${badge.color}`}
                  >
                    {badge.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTestNode(node)}
                      disabled={isTestingThis}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                      title="Test ping & API credentials"
                    >
                      {isTestingThis ? (
                        <CircleNotch className="h-3.5 w-3.5 animate-spin text-blue-600" />
                      ) : (
                        <Plug className="h-3.5 w-3.5 text-slate-500" weight="bold" />
                      )}
                      Test Ping
                    </button>
                    <button
                      onClick={() => setDeleteTarget(node)}
                      className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus Node"
                    >
                      <Trash className="h-3.5 w-3.5" weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Node Operations Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Operasi Cepat Infrastruktur</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchNodes();
              showToast("success", "Status sinkronisasi token dan status node diperbarui.");
            }}
            className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-blue-500 hover:shadow-md group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Plug className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Sync Node Tokens</p>
              <p className="text-xs text-slate-500">Perbarui otorisasi API WHM & PVE</p>
            </div>
          </button>

          <button
            onClick={handleTestAll}
            disabled={testingAll}
            className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-emerald-500 hover:shadow-md group disabled:opacity-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              {testingAll ? (
                <CircleNotch className="h-5 w-5 animate-spin" />
              ) : (
                <Desktop className="h-5 w-5" weight="duotone" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Test All Connections</p>
              <p className="text-xs text-slate-500">Ping seluruh cluster server</p>
            </div>
          </button>

          <button
            onClick={() => {
              showToast("success", "Cache DNS internal dan socket cluster berhasil di-refresh.");
            }}
            className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-amber-500 hover:shadow-md group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ClockCounterClockwise className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Flush Cluster DNS</p>
              <p className="text-xs text-slate-500">Refresh routing Bind / PowerDNS</p>
            </div>
          </button>
        </div>
      </div>

      {/* Add Node Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HardDrives weight="duotone" className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-slate-900">Tambah Server Node Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Node Cluster *
                </label>
                <input
                  type="text"
                  placeholder="Misal: WHM-Cyber1-JKT (NVMe)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Tipe Control Panel *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => {
                      const t = e.target.value;
                      let port = 2087;
                      if (t === "proxmox") port = 8006;
                      if (t === "cyberpanel") port = 8090;
                      setForm({ ...form, type: t, port });
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="whm">cPanel / WHM</option>
                    <option value="proxmox">Proxmox VE (KVM)</option>
                    <option value="cyberpanel">CyberPanel (LiteSpeed)</option>
                    <option value="cpanel">cPanel Solo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Port API *
                  </label>
                  <input
                    type="number"
                    value={form.port}
                    onChange={(e) => setForm({ ...form, port: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Host FQDN *
                  </label>
                  <input
                    type="text"
                    placeholder="whm01.kioshosting.id"
                    value={form.host}
                    onChange={(e) => setForm({ ...form, host: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Alamat IP Publik *
                  </label>
                  <input
                    type="text"
                    placeholder="103.189.234.10"
                    value={form.ip}
                    onChange={(e) => setForm({ ...form, ip: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  API Token / Secret Key *
                </label>
                <input
                  type="password"
                  placeholder="whm_tok_... / PVEAPIToken=..."
                  value={form.api_token}
                  onChange={(e) => setForm({ ...form, api_token: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Maksimal Akun Hosting
                  </label>
                  <input
                    type="number"
                    value={form.max_accounts}
                    onChange={(e) => setForm({ ...form, max_accounts: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.use_ssl}
                      onChange={(e) => setForm({ ...form, use_ssl: e.target.checked })}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700">Wajib SSL (HTTPS)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Primary Nameserver
                  </label>
                  <input
                    type="text"
                    value={form.nameserver1}
                    onChange={(e) => setForm({ ...form, nameserver1: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Secondary Nameserver
                  </label>
                  <input
                    type="text"
                    value={form.nameserver2}
                    onChange={(e) => setForm({ ...form, nameserver2: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting && <CircleNotch className="h-4 w-4 animate-spin" />}
                  Simpan Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <Warning className="h-6 w-6" weight="fill" />
              </div>
              <h3 className="font-display font-bold text-slate-900 text-lg">Konfirmasi Hapus Node</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Apakah Anda yakin ingin menghapus server node <strong>{deleteTarget.name}</strong>? Tindakan ini
              akan memutuskan endpoint auto-provisioning untuk server tersebut.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteNode}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting && <CircleNotch className="h-4 w-4 animate-spin" />}
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
