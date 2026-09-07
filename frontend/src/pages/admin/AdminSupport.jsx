import React, { useState, useEffect } from "react";
import {
  Lifebuoy,
  PaperPlaneRight,
  User,
  Clock,
  CheckCircle,
  Warning,
  X,
  CircleNotch,
  MagnifyingGlass,
  Plus,
  Trash,
  ChatCircleText,
  ArrowsClockwise,
  EnvelopeSimple,
  ShieldCheck,
  Check,
} from "@phosphor-icons/react";
import { api } from "../../lib/auth";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    open_count: 0,
    in_progress_count: 0,
    high_priority_count: 0,
    closed_count: 0,
    total_count: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Conversation Detail Drawer / Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("Answered");

  // Create Ticket Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    user_id: "",
    subject: "",
    department: "Technical",
    priority: "Medium",
    message: "",
  });

  // Delete Confirmation Modal
  const [deleteTicketModal, setDeleteTicketModal] = useState(null);

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

  // Load tickets & clients
  async function loadTickets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (deptFilter !== "All") params.append("department", deptFilter);
      if (priorityFilter !== "All") params.append("priority", priorityFilter);

      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await api("GET", `/admin/support/tickets${qs}`);

      setTickets(Array.isArray(res.tickets) ? res.tickets : []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error("Gagal memuat tiket:", err);
      showToast("error", "Gagal mengambil data tiket bantuan.");
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    try {
      const res = await api("GET", "/admin/clients");
      const clientList = Array.isArray(res) ? res : res.clients || [];
      setClients(clientList);
      if (clientList.length > 0 && !newTicket.user_id) {
        setNewTicket((prev) => ({ ...prev, user_id: clientList[0].id }));
      }
    } catch (err) {
      console.error("Gagal memuat daftar klien:", err);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [statusFilter, deptFilter, priorityFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadClients();
  }, []);

  // Fetch full ticket details for drawer
  async function openTicketDetail(ticketId) {
    setDetailLoading(true);
    try {
      const res = await api("GET", `/admin/support/tickets/${ticketId}`);
      setSelectedTicket(res.ticket);
      setReplyStatus("Answered");
      setReplyText("");
    } catch (err) {
      showToast("error", "Gagal membuka detail tiket.");
    } finally {
      setDetailLoading(false);
    }
  }

  // Submit Admin Reply
  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setActionLoading(true);
      const res = await api("POST", `/admin/support/tickets/${selectedTicket.id}/reply`, {
        message: replyText.trim(),
        set_status: replyStatus,
      });

      setSelectedTicket(res.ticket);
      setReplyText("");
      showToast("success", "Balasan berhasil dikirim ke klien!");

      // Update in local tickets list
      setTickets((prev) =>
        prev.map((t) => (t.id === res.ticket.id ? { ...res.ticket, reply_count: res.ticket.replies?.length || 0 } : t))
      );

      // Refresh counters
      const refRes = await api("GET", "/admin/support/tickets");
      if (refRes.stats) setStats(refRes.stats);
    } catch (err) {
      showToast("error", err.message || "Gagal mengirim balasan.");
    } finally {
      setActionLoading(false);
    }
  }

  // Quick Status Transition
  async function handleUpdateStatus(ticketId, newStatus, newPriority = null) {
    try {
      setActionLoading(true);
      const payload = { status: newStatus };
      if (newPriority) payload.priority = newPriority;

      const res = await api("PUT", `/admin/support/tickets/${ticketId}/status`, payload);

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(res.ticket);
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: res.ticket.status, priority: res.ticket.priority } : t))
      );

      showToast("success", `Status tiket berhasil diubah menjadi "${newStatus}"!`);

      // Refresh counters
      const refRes = await api("GET", "/admin/support/tickets");
      if (refRes.stats) setStats(refRes.stats);
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah status tiket.");
    } finally {
      setActionLoading(false);
    }
  }

  // Create new ticket (Admin opening on behalf of client)
  async function handleCreateTicket(e) {
    e.preventDefault();
    if (!newTicket.user_id || !newTicket.subject.trim() || !newTicket.message.trim()) {
      showToast("error", "Mohon lengkapi semua data tiket.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api("POST", "/admin/support/tickets", {
        user_id: parseInt(newTicket.user_id),
        subject: newTicket.subject.trim(),
        department: newTicket.department,
        priority: newTicket.priority,
        message: newTicket.message.trim(),
      });

      setTickets((prev) => [res.ticket, ...prev]);
      setIsCreateModalOpen(false);
      setNewTicket({
        user_id: clients[0]?.id || "",
        subject: "",
        department: "Technical",
        priority: "Medium",
        message: "",
      });
      showToast("success", `Tiket ${res.ticket.code} berhasil dibuat!`);

      // Refresh counters
      const refRes = await api("GET", "/admin/support/tickets");
      if (refRes.stats) setStats(refRes.stats);
    } catch (err) {
      showToast("error", err.message || "Gagal membuat tiket baru.");
    } finally {
      setActionLoading(false);
    }
  }

  // Delete ticket
  async function handleDeleteTicket() {
    if (!deleteTicketModal) return;
    try {
      setActionLoading(true);
      await api("DELETE", `/admin/support/tickets/${deleteTicketModal.id}`);

      setTickets((prev) => prev.filter((t) => t.id !== deleteTicketModal.id));
      if (selectedTicket && selectedTicket.id === deleteTicketModal.id) {
        setSelectedTicket(null);
      }
      setDeleteTicketModal(null);
      showToast("success", "Tiket berhasil dihapus.");

      // Refresh counters
      const refRes = await api("GET", "/admin/support/tickets");
      if (refRes.stats) setStats(refRes.stats);
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus tiket.");
    } finally {
      setActionLoading(false);
    }
  }

  function formatTime(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  }

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
          <h1 className="text-2xl font-display font-bold text-slate-900">Support & Helpdesk</h1>
          <p className="text-sm text-slate-500">
            Kelola tiket bantuan klien, respon kendala teknis, dan pantau SLA layanan KiosHosting
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadTickets}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            title="Refresh Data"
          >
            <ArrowsClockwise className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" weight="bold" />
            <span>Buat Tiket Baru</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tiket Terbuka</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-amber-600">{stats.open_count || 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">Membutuhkan respon awal</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="h-6 w-6" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Dalam Penanganan</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-blue-600">{stats.in_progress_count || 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">Sedang diproses teknisi</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <PaperPlaneRight className="h-6 w-6" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Prioritas Tinggi</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-rose-600">{stats.high_priority_count || 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">Kategori High & Urgent</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <Warning className="h-6 w-6" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tiket Selesai</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-emerald-600">{stats.closed_count || 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">Tuntas diselesaikan</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="h-6 w-6" weight="duotone" />
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {[
            { key: "All", label: "Semua Tiket", count: stats.total_count },
            { key: "Open", label: "Open", count: stats.open_count },
            { key: "In Progress", label: "In Progress" },
            { key: "Answered", label: "Answered" },
            { key: "Closed", label: "Closed", count: stats.closed_count },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === tab.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    statusFilter === tab.key ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div className="grid gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-6 lg:col-span-6">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode tiket, subjek, atau nama klien..."
              style={{ colorScheme: "light" }}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ colorScheme: "light" }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="All">Semua Departemen</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="Sales">Sales</option>
              <option value="Domain">Domain</option>
            </select>
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ colorScheme: "light" }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="All">Semua Prioritas</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <CircleNotch className="h-8 w-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Memuat tiket bantuan...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Lifebuoy className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700">Tidak ada tiket ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Kode & Subjek</th>
                  <th className="px-6 py-4 font-semibold">Klien</th>
                  <th className="px-6 py-4 font-semibold">Departemen</th>
                  <th className="px-6 py-4 font-semibold">Prioritas</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Balasan</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => openTicketDetail(t.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors max-w-md truncate">
                        {t.subject}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-500">{t.code}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {timeAgo(t.created_at)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                          {t.user?.Name ? t.user.Name.charAt(0) : "U"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 leading-tight">{t.user?.Name || "User #" + t.user_id}</p>
                          <p className="text-xs text-slate-400">{t.user?.Email || "-"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          t.department === "Technical"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : t.department === "Billing"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : t.department === "Domain"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {t.department}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          t.priority === "Urgent"
                            ? "bg-rose-100 text-rose-700 border border-rose-300"
                            : t.priority === "High"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : t.priority === "Medium"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          t.status === "Open"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : t.status === "Answered"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : t.status === "In Progress"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {t.status === "Open" && <Clock weight="bold" className="h-3 w-3" />}
                        {t.status === "Answered" && <PaperPlaneRight weight="fill" className="h-3 w-3" />}
                        {t.status === "In Progress" && <CircleNotch weight="bold" className="h-3 w-3 animate-spin" />}
                        {t.status === "Closed" && <CheckCircle weight="fill" className="h-3 w-3" />}
                        <span>{t.status}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <ChatCircleText className="h-4 w-4 text-slate-400" />
                        <span>{t.reply_count !== undefined ? t.reply_count : t.replies?.length || 0}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openTicketDetail(t.id)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm transition-all hover:bg-blue-50"
                        >
                          Buka / Balas
                        </button>
                        <button
                          onClick={() => setDeleteTicketModal(t)}
                          className="rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100"
                          title="Hapus Tiket"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================== CONVERSATION DETAIL DRAWER / MODAL ===================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200 text-slate-900"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                      {selectedTicket.code}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        selectedTicket.priority === "Urgent"
                          ? "bg-rose-100 text-rose-700"
                          : selectedTicket.priority === "High"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedTicket.priority}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        selectedTicket.status === "Open"
                          ? "bg-amber-100 text-amber-800"
                          : selectedTicket.status === "Closed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-display font-bold text-slate-900">{selectedTicket.subject}</h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Metadata row */}
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs border-t border-slate-200/60 pt-3 text-slate-600">
                <div>
                  <p className="text-slate-400 font-medium">Klien:</p>
                  <p className="font-bold text-slate-900">{selectedTicket.user?.Name || "User #" + selectedTicket.user_id}</p>
                  <p className="text-[11px] text-slate-500">{selectedTicket.user?.Email}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Departemen:</p>
                  <p className="font-bold text-slate-900">{selectedTicket.department}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Dibuat Pada:</p>
                  <p className="font-bold text-slate-900">{formatTime(selectedTicket.created_at)}</p>
                </div>
              </div>

              {/* Quick Status Action Bar */}
              <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-200/60">
                <span className="text-xs font-semibold text-slate-500">Ubah Status:</span>
                {selectedTicket.status !== "Open" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, "Open")}
                    className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    Set Open
                  </button>
                )}
                {selectedTicket.status !== "In Progress" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, "In Progress")}
                    className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    Set In Progress
                  </button>
                )}
                {selectedTicket.status !== "Closed" ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, "Closed")}
                    className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    Tandai Selesai (Close)
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, "Open")}
                    className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    Buka Kembali Tiket
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40">
              {/* Original Client Question / Issue */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase">
                      {selectedTicket.user?.Name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{selectedTicket.user?.Name || "Klien"}</p>
                      <p className="text-[11px] text-slate-400">Pembuat Tiket (Klien)</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{formatTime(selectedTicket.created_at)}</span>
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Replies Timeline */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-4">
                  {selectedTicket.replies.map((reply, idx) => (
                    <div
                      key={reply.id || idx}
                      className={`rounded-2xl p-5 shadow-sm border transition-all ${
                        reply.is_admin
                          ? "bg-blue-50/70 border-blue-200 ml-4"
                          : "bg-white border-slate-200 mr-4"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
                        <div className="flex items-center gap-2.5">
                          {reply.is_admin ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                              <ShieldCheck className="h-4 w-4" weight="fill" />
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xs uppercase">
                              {reply.user?.Name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              {reply.is_admin ? (
                                <>
                                  <span>{reply.user?.Name || "Admin Support"}</span>
                                  <span className="rounded bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white uppercase">
                                    Official Staff
                                  </span>
                                </>
                              ) : (
                                <span>{reply.user?.Name || selectedTicket.user?.Name}</span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {reply.is_admin ? "KiosHosting Technical Support" : "Klien"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{formatTime(reply.created_at)}</span>
                      </div>
                      <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {reply.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Composer Bar */}
            <div className="p-5 border-t border-slate-200 bg-white">
              <form onSubmit={handleSendReply} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Kirim Balasan Resmi
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tuliskan jawaban atau solusi untuk kendala klien..."
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Status Setelah Kirim:</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      style={{ colorScheme: "light" }}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="Answered">Answered (Dijawab)</option>
                      <option value="In Progress">In Progress (Diproses)</option>
                      <option value="Closed">Closed (Selesai & Tutup)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || !replyText.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 active:scale-95"
                  >
                    {actionLoading ? (
                      <CircleNotch className="h-4 w-4 animate-spin" />
                    ) : (
                      <PaperPlaneRight className="h-4 w-4" weight="fill" />
                    )}
                    <span>Kirim Balasan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL BUAT TIKET BARU ===================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Lifebuoy className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Buka Tiket Bantuan Klien</h3>
                  <p className="text-xs text-slate-500">Buat tiket penanganan langsung atas nama klien</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pilih Klien
                </label>
                <select
                  required
                  value={newTicket.user_id}
                  onChange={(e) => setNewTicket({ ...newTicket, user_id: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {clients.length === 0 ? (
                    <option value="">Tidak ada klien terdaftar</option>
                  ) : (
                    clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subjek Kendala
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="cth. Kendala migrasi database MySQL"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Departemen
                  </label>
                  <select
                    value={newTicket.department}
                    onChange={(e) => setNewTicket({ ...newTicket, department: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Sales">Sales</option>
                    <option value="Domain">Domain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Prioritas
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Rincian Pesan / Deskripsi
                </label>
                <textarea
                  rows={4}
                  required
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Jelaskan detail kendala atau pertanyaan teknis..."
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
                  <span>Buat Tiket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL KONFIRMASI HAPUS ===================== */}
      {deleteTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <Trash className="h-6 w-6" weight="bold" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Hapus Tiket Bantuan?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus tiket{" "}
              <strong className="text-slate-900 font-mono">{deleteTicketModal.code}</strong> (
              {deleteTicketModal.subject})? Seluruh riwayat balasan juga akan terhapus.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTicketModal(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteTicket}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                <span>Ya, Hapus Tiket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
