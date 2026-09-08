import React, { useState, useEffect } from "react";
import {
  Globe,
  ShieldCheck,
  Lock,
  LockOpen,
  Key,
  ArrowsClockwise,
  Plus,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  WarningCircle,
  Copy,
  PencilSimple,
  Trash,
  SlidersHorizontal,
  CircleNotch,
  ArrowSquareOut,
  Sparkle,
  HardDrives,
  Clock,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import { api } from "../../lib/auth";

export default function AdminDomains() {
  const [domains, setDomains] = useState([]);
  const [stats, setStats] = useState({
    total_domains: 0,
    pandi_id: 0,
    gtld_domains: 0,
    expiring_soon: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [registrarFilter, setRegistrarFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedDomainForDNS, setSelectedDomainForDNS] = useState(null);
  const [dnsRecords, setDnsRecords] = useState([]);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [showAddDNSRecord, setShowAddDNSRecord] = useState(false);
  const [eppModalDomain, setEppModalDomain] = useState(null);
  const [eppData, setEppData] = useState(null);
  const [nsModalDomain, setNsModalDomain] = useState(null);
  const [nsForm, setNsForm] = useState({ ns1: "", ns2: "", ns3: "", ns4: "" });

  // New DNS Record Form
  const [newRecordForm, setNewRecordForm] = useState({
    type: "A",
    name: "@",
    content: "",
    ttl: 3600,
    priority: 0,
  });

  // Register Form
  const [clients, setClients] = useState([]);
  const [registerForm, setRegisterForm] = useState({
    user_id: "",
    domain_name: "",
    registrar: "pandi",
    years: 1,
    whois_privacy: true,
    auto_renew: true,
    ns1: "ns1.kioshosting.id",
    ns2: "ns2.kioshosting.id",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/v1/admin/domains?page=${page}&limit=15&registrar=${registrarFilter}&status=${statusFilter}&search=${encodeURIComponent(
          search
        )}`
      );
      if (res) {
        setDomains(res.data || []);
        setStats(res.stats || stats);
        setTotalPages(res.total_pages || 1);
      }
    } catch (err) {
      console.error("Error fetching domains:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get("/api/v1/admin/clients?limit=50");
      if (res && res.data) setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  useEffect(() => {
    fetchDomains();
    fetchClients();
  }, [page, registrarFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDomains();
  };

  // Toggle Security Features (Lock, Privacy, Renew)
  const handleToggleSecurity = async (domainId, field, currentValue) => {
    const nextValue = !currentValue;
    setActionLoading(`${domainId}-${field}`);
    try {
      await api.put(`/api/v1/admin/domains/${domainId}/security`, {
        field,
        value: nextValue,
      });
      showToast(`Pengaturan ${field} berhasil diperbarui!`);
      // Local optimistic update
      setDomains((prev) =>
        prev.map((d) => {
          if (d.id === domainId) {
            if (field === "lock") return { ...d, is_locked: nextValue };
            if (field === "privacy") return { ...d, whois_privacy: nextValue };
            if (field === "renew") return { ...d, auto_renew: nextValue };
          }
          return d;
        })
      );
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal mengubah pengaturan", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // EPP Management
  const openEPPModal = async (domain) => {
    setEppModalDomain(domain);
    setEppData(null);
    try {
      const res = await api.get(`/api/v1/admin/domains/${domain.id}/epp`);
      setEppData(res);
    } catch (err) {
      showToast("Gagal mengambil EPP Auth Code", "error");
    }
  };

  const handleRegenerateEPP = async () => {
    if (!eppModalDomain) return;
    setActionLoading("regen-epp");
    try {
      const res = await api.get(`/api/v1/admin/domains/${eppModalDomain.id}/epp?regenerate=true`);
      setEppData(res);
      showToast("EPP Auth Code berhasil dibuat ulang!");
    } catch (err) {
      showToast("Gagal membuat ulang EPP Code", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Nameservers Modal
  const openNSModal = (domain) => {
    setNsModalDomain(domain);
    setNsForm({
      ns1: domain.ns1 || "ns1.kioshosting.id",
      ns2: domain.ns2 || "ns2.kioshosting.id",
      ns3: domain.ns3 || "",
      ns4: domain.ns4 || "",
    });
  };

  const handleSaveNameservers = async (e) => {
    e.preventDefault();
    if (!nsModalDomain) return;
    setActionLoading("save-ns");
    try {
      await api.put(`/api/v1/admin/domains/${nsModalDomain.id}/nameservers`, nsForm);
      showToast("Nameserver berhasil diperbarui ke registrar!");
      setNsModalDomain(null);
      fetchDomains();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui nameserver", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // DNS Zone Editor Modal
  const openDNSModal = async (domain) => {
    setSelectedDomainForDNS(domain);
    setDnsLoading(true);
    setShowAddDNSRecord(false);
    try {
      const res = await api.get(`/api/v1/admin/domains/${domain.id}/dns`);
      if (res && res.records) {
        setDnsRecords(res.records);
      }
    } catch (err) {
      showToast("Gagal memuat zona DNS", "error");
    } finally {
      setDnsLoading(false);
    }
  };

  const handleCreateDNSRecord = async (e) => {
    e.preventDefault();
    if (!selectedDomainForDNS) return;
    setActionLoading("add-dns");
    try {
      const res = await api.post(`/api/v1/admin/domains/${selectedDomainForDNS.id}/dns`, {
        ...newRecordForm,
        ttl: parseInt(newRecordForm.ttl, 10),
        priority: parseInt(newRecordForm.priority, 10),
      });
      showToast("DNS Record berhasil ditambahkan!");
      setDnsRecords((prev) => [...prev, res.data]);
      setShowAddDNSRecord(false);
      setNewRecordForm({ type: "A", name: "@", content: "", ttl: 3600, priority: 0 });
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menambah DNS record", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDNSRecord = async (recordId) => {
    if (!selectedDomainForDNS) return;
    setActionLoading(`del-dns-${recordId}`);
    try {
      await api.delete(`/api/v1/admin/domains/${selectedDomainForDNS.id}/dns/${recordId}`);
      showToast("DNS Record berhasil dihapus");
      setDnsRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (err) {
      showToast("Gagal menghapus DNS record", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplyPreset = async (presetName) => {
    if (!selectedDomainForDNS) return;
    setActionLoading(`preset-${presetName}`);
    try {
      const res = await api.post(`/api/v1/admin/domains/${selectedDomainForDNS.id}/dns/preset`, {
        preset: presetName,
      });
      showToast(res.message || `Preset ${presetName} berhasil diterapkan!`);
      // Reload records
      const fresh = await api.get(`/api/v1/admin/domains/${selectedDomainForDNS.id}/dns`);
      if (fresh && fresh.records) setDnsRecords(fresh.records);
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menerapkan preset", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegisterDomain = async (e) => {
    e.preventDefault();
    setActionLoading("register-dom");
    try {
      const res = await api.post("/api/v1/admin/domains", {
        ...registerForm,
        user_id: parseInt(registerForm.user_id, 10),
        years: parseInt(registerForm.years, 10),
      });
      showToast(res.message || "Domain berhasil didaftarkan!");
      setShowRegisterModal(false);
      setRegisterForm({
        user_id: "",
        domain_name: "",
        registrar: "pandi",
        years: 1,
        whois_privacy: true,
        auto_renew: true,
        ns1: "ns1.kioshosting.id",
        ns2: "ns2.kioshosting.id",
      });
      fetchDomains();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal mendaftarkan domain", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast */}
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-7 text-white shadow-xl border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-xs font-semibold text-sky-400 uppercase tracking-wider">
              <Globe weight="duotone" className="h-4 w-4 text-sky-400" />
              Domain Lifecycle & Registrar Hub
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-display">
              Domain Registrar & DNS Manager
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Integrasi API langsung ke registrar (PANDI untuk .ID, ResellerClub & Namecheap untuk gTLD).
              Kelola EPP Transfer Code, Registrar Lock, WHOIS Privacy, serta Interactive DNS Zone Editor.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all active:scale-[0.98] shrink-0"
          >
            <Plus weight="bold" className="h-4 w-4" />
            Daftarkan / Import Domain
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Domain</span>
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Globe weight="duotone" className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-display">
              {stats.total_domains}
            </span>
            <span className="text-xs text-slate-500">Domain Terkelola</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <ShieldCheck weight="fill" className="h-4 w-4 text-emerald-500" />
            Terhubung Registrar API
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">PANDI (.ID ccTLD)</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 font-bold text-xs">
              .ID
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-display">
              {stats.pandi_id}
            </span>
            <span className="text-xs text-slate-500">Domain Indonesia</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
            Konektor EPP Resmi PANDI
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">gTLD Internasional</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold text-xs">
              .COM
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-display">
              {stats.gtld_domains}
            </span>
            <span className="text-xs text-slate-500">.com, .net, .org</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
            ResellerClub & Namecheap Sync
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Expired Dalam 30 Hari</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock weight="duotone" className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-display">
              {stats.expiring_soon}
            </span>
            <span className="text-xs text-amber-600 font-semibold">Perlu Perpanjangan</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
            Auto-Renewal & Notifikasi Aktif
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari domain name atau nama pemilik..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={registrarFilter}
              onChange={(e) => {
                setRegistrarFilter(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Semua Registrar</option>
              <option value="pandi">PANDI (.ID)</option>
              <option value="resellerclub">ResellerClub</option>
              <option value="namecheap">Namecheap</option>
            </select>

            <button
              onClick={fetchDomains}
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
                <th className="py-3.5 px-4">Nama Domain</th>
                <th className="py-3.5 px-4">Registrar</th>
                <th className="py-3.5 px-4">Client / Pemilik</th>
                <th className="py-3.5 px-4">Masa Berlaku (Expiry)</th>
                <th className="py-3.5 px-4 text-center">Registrar Lock</th>
                <th className="py-3.5 px-4 text-center">WHOIS Privacy</th>
                <th className="py-3.5 px-4 text-right">Alat Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <CircleNotch className="h-6 w-6 animate-spin mx-auto text-sky-500 mb-2" />
                    Memuat data domain registrar...
                  </td>
                </tr>
              ) : domains.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Tidak ada domain yang ditemukan.
                  </td>
                </tr>
              ) : (
                domains.map((dom) => {
                  const expiryDate = new Date(dom.expires_at);
                  const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = daysLeft <= 30;

                  return (
                    <tr key={dom.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {dom.domain_name}
                          <a
                            href={`https://${dom.domain_name}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-sky-600"
                          >
                            <ArrowSquareOut className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          NS: {dom.ns1}, {dom.ns2}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                            dom.registrar === "pandi"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : dom.registrar === "namecheap"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {dom.registrar}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{dom.client?.Name || "Client"}</div>
                        <div className="text-[11px] text-slate-400">{dom.client?.Email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {expiryDate.toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {isExpiringSoon ? (
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <WarningCircle weight="fill" className="h-3.5 w-3.5 text-amber-500" />
                              {daysLeft > 0 ? `${daysLeft} hari lagi` : "Kadaluarsa"}
                            </span>
                          ) : (
                            <span className="text-slate-500">{daysLeft} hari lagi</span>
                          )}
                        </div>
                      </td>

                      {/* Registrar Lock Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleSecurity(dom.id, "lock", dom.is_locked)}
                          disabled={actionLoading === `${dom.id}-lock`}
                          title={dom.is_locked ? "Domain Terkunci (Aman dari Transfer Liar)" : "Domain Terbuka (Siap Ditransfer)"}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                            dom.is_locked
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {dom.is_locked ? (
                            <Lock weight="bold" className="h-3 w-3" />
                          ) : (
                            <LockOpen weight="bold" className="h-3 w-3" />
                          )}
                          {dom.is_locked ? "Locked" : "Unlocked"}
                        </button>
                      </td>

                      {/* WHOIS Privacy Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleSecurity(dom.id, "privacy", dom.whois_privacy)}
                          disabled={actionLoading === `${dom.id}-privacy`}
                          title="Sembunyikan data identitas pemilik dari pencarian WHOIS publik"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                            dom.whois_privacy
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <ShieldCheck weight="bold" className="h-3 w-3" />
                          {dom.whois_privacy ? "Protected" : "Public"}
                        </button>
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openDNSModal(dom)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold text-[11px] transition-all"
                          >
                            <SlidersHorizontal weight="bold" className="h-3.5 w-3.5" />
                            DNS Zone
                          </button>

                          <button
                            onClick={() => openEPPModal(dom)}
                            title="Lihat EPP / Auth Transfer Code"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all"
                          >
                            <Key weight="bold" className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => openNSModal(dom)}
                            title="Kelola Nameservers"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all"
                          >
                            <HardDrives weight="bold" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* MODAL: Interactive DNS Zone Editor */}
      {selectedDomainForDNS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal weight="duotone" className="h-5 w-5 text-sky-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    DNS Zone Editor: {selectedDomainForDNS.domain_name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola record DNS langsung ke nameserver authoritative. Perubahan terpropagasi secara real-time.
                </p>
              </div>

              <button
                onClick={() => setSelectedDomainForDNS(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Quick 1-Click DNS Presets */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkle weight="duotone" className="h-4 w-4 text-sky-600" />
                Preset 1-Klik Enterprise:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleApplyPreset("google_workspace")}
                  disabled={actionLoading === "preset-google_workspace"}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                >
                  Google Workspace (Gmail)
                </button>
                <button
                  onClick={() => handleApplyPreset("microsoft_365")}
                  disabled={actionLoading === "preset-microsoft_365"}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                >
                  Microsoft 365
                </button>
                <button
                  onClick={() => handleApplyPreset("cloudflare")}
                  disabled={actionLoading === "preset-cloudflare"}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                >
                  Cloudflare Proxy
                </button>
                <button
                  onClick={() => handleApplyPreset("default")}
                  disabled={actionLoading === "preset-default"}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                >
                  Reset Default
                </button>
              </div>
            </div>

            {/* Records Table and Add Button */}
            <div className="mt-4 flex-1 overflow-y-auto min-h-0 border border-slate-200 rounded-xl">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Daftar Record DNS ({dnsRecords.length})
                </span>
                <button
                  onClick={() => setShowAddDNSRecord(!showAddDNSRecord)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-xs"
                >
                  <Plus weight="bold" className="h-3.5 w-3.5" />
                  {showAddDNSRecord ? "Tutup Form" : "Tambah Record"}
                </button>
              </div>

              {/* Inline Add Record Form */}
              {showAddDNSRecord && (
                <form onSubmit={handleCreateDNSRecord} className="p-4 bg-sky-50/50 border-b border-sky-100 grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tipe</label>
                    <select
                      value={newRecordForm.type}
                      onChange={(e) => setNewRecordForm({ ...newRecordForm, type: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white border border-slate-300 font-bold"
                    >
                      <option value="A">A</option>
                      <option value="AAAA">AAAA</option>
                      <option value="CNAME">CNAME</option>
                      <option value="MX">MX</option>
                      <option value="TXT">TXT</option>
                      <option value="SRV">SRV</option>
                      <option value="NS">NS</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Name / Host</label>
                    <input
                      type="text"
                      required
                      placeholder="@ atau subdomain"
                      value={newRecordForm.name}
                      onChange={(e) => setNewRecordForm({ ...newRecordForm, name: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white border border-slate-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Target / Nilai Content</label>
                    <input
                      type="text"
                      required
                      placeholder="IP Address atau hostname"
                      value={newRecordForm.content}
                      onChange={(e) => setNewRecordForm({ ...newRecordForm, content: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">TTL (Detik)</label>
                    <input
                      type="number"
                      value={newRecordForm.ttl}
                      onChange={(e) => setNewRecordForm({ ...newRecordForm, ttl: e.target.value })}
                      className="w-full p-2 rounded-lg bg-white border border-slate-300"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={actionLoading === "add-dns"}
                      className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      {actionLoading === "add-dns" ? <CircleNotch className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle weight="bold" className="h-3.5 w-3.5" />}
                      Simpan
                    </button>
                  </div>
                </form>
              )}

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3 w-16">Tipe</th>
                    <th className="py-2.5 px-3">Name / Host</th>
                    <th className="py-2.5 px-3">Target / Content</th>
                    <th className="py-2.5 px-3 w-20">TTL</th>
                    <th className="py-2.5 px-3 w-20">Prioritas</th>
                    <th className="py-2.5 px-3 w-16 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {dnsLoading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-sans">
                        <CircleNotch className="h-5 w-5 animate-spin mx-auto text-sky-500 mb-2" />
                        Memuat record...
                      </td>
                    </tr>
                  ) : dnsRecords.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-sans">
                        Belum ada record DNS. Klik "Tambah Record" untuk membuat.
                      </td>
                    </tr>
                  ) : (
                    dnsRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-[10px]">
                            {rec.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-semibold">{rec.name}</td>
                        <td className="py-2.5 px-3 text-slate-700 break-all">{rec.content}</td>
                        <td className="py-2.5 px-3 text-slate-500">{rec.ttl}</td>
                        <td className="py-2.5 px-3 text-slate-500">{rec.priority || "-"}</td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <button
                            onClick={() => handleDeleteDNSRecord(rec.id)}
                            disabled={actionLoading === `del-dns-${rec.id}`}
                            className="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Hapus Record"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedDomainForDNS(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EPP / Auth Transfer Code */}
      {eppModalDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Key weight="bold" className="h-5 w-5 text-sky-600" />
                EPP / Auth Transfer Code
              </h3>
              <button
                onClick={() => setEppModalDomain(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Kode otentikasi unik untuk transfer domain <strong className="text-slate-800">{eppModalDomain.domain_name}</strong> ke registrar lain.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Secret Auth Code
              </label>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-base text-slate-900 select-all">
                  {eppData?.epp_code || "Memuat..."}
                </span>
                {eppData?.epp_code && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(eppData.epp_code);
                      showToast("EPP Code disalin ke clipboard!");
                    }}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
                    title="Salin Code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2">
              <button
                onClick={handleRegenerateEPP}
                disabled={actionLoading === "regen-epp"}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                <ArrowsClockwise weight="bold" className="h-3.5 w-3.5" />
                Buat Ulang EPP Code
              </button>

              <button
                onClick={() => setEppModalDomain(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Manage Nameservers */}
      {nsModalDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HardDrives weight="bold" className="h-5 w-5 text-sky-600" />
                Ubah Nameservers
              </h3>
              <button
                onClick={() => setNsModalDomain(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Tentukan nameserver authoritative untuk domain <strong className="text-slate-800">{nsModalDomain.domain_name}</strong>.
            </p>

            <form onSubmit={handleSaveNameservers} className="mt-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nameserver 1 (Primary) *</label>
                <input
                  type="text"
                  required
                  value={nsForm.ns1}
                  onChange={(e) => setNsForm({ ...nsForm, ns1: e.target.value })}
                  placeholder="ns1.kioshosting.id"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nameserver 2 (Secondary) *</label>
                <input
                  type="text"
                  required
                  value={nsForm.ns2}
                  onChange={(e) => setNsForm({ ...nsForm, ns2: e.target.value })}
                  placeholder="ns2.kioshosting.id"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nameserver 3 (Opsional)</label>
                <input
                  type="text"
                  value={nsForm.ns3}
                  onChange={(e) => setNsForm({ ...nsForm, ns3: e.target.value })}
                  placeholder="ns3.kioshosting.id"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNsModalDomain(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "save-ns"}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-xs"
                >
                  Simpan ke Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Register / Import Domain */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe weight="duotone" className="h-5 w-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Registrasi / Import Domain</h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDomain} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Pilih Klien Pemilik</label>
                <select
                  required
                  value={registerForm.user_id}
                  onChange={(e) => setRegisterForm({ ...registerForm, user_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="">-- Pilih Klien --</option>
                  {clients.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name} ({cl.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Domain Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="bisnisbaru.id atau perusahaan.com"
                  value={registerForm.domain_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, domain_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Registrar Penyedia</label>
                  <select
                    value={registerForm.registrar}
                    onChange={(e) => setRegisterForm({ ...registerForm, registrar: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="pandi">PANDI (.ID ccTLD)</option>
                    <option value="resellerclub">ResellerClub</option>
                    <option value="namecheap">Namecheap</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Durasi Pendaftaran</label>
                  <select
                    value={registerForm.years}
                    onChange={(e) => setRegisterForm({ ...registerForm, years: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="1">1 Tahun</option>
                    <option value="2">2 Tahun</option>
                    <option value="3">3 Tahun</option>
                    <option value="5">5 Tahun</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reg_whois"
                    checked={registerForm.whois_privacy}
                    onChange={(e) => setRegisterForm({ ...registerForm, whois_privacy: e.target.checked })}
                    className="h-4 w-4 text-sky-600 rounded"
                  />
                  <label htmlFor="reg_whois" className="font-medium text-slate-800">
                    Aktifkan WHOIS Privacy ID Protection
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reg_autorenew"
                    checked={registerForm.auto_renew}
                    onChange={(e) => setRegisterForm({ ...registerForm, auto_renew: e.target.checked })}
                    className="h-4 w-4 text-sky-600 rounded"
                  />
                  <label htmlFor="reg_autorenew" className="font-medium text-slate-800">
                    Aktifkan Auto-Renewal Sebelum Expired
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "register-dom"}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/20 flex items-center gap-1.5"
                >
                  {actionLoading === "register-dom" ? <CircleNotch className="h-4 w-4 animate-spin" /> : null}
                  Daftarkan Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
