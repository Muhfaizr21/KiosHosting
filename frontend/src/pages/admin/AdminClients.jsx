import React, { useEffect, useState, useRef } from "react";
import {
  MagnifyingGlass,
  Funnel,
  DotsThree,
  Trash,
  LockKey,
  LockKeyOpen,
  CheckCircle,
  CaretLeft,
  CaretRight,
  UserPlus,
  PencilSimple,
  Key,
  X,
  Warning,
  CircleNotch,
} from "@phosphor-icons/react";
import {
  getClients,
  createClient,
  updateClient,
  updateClientStatus,
  deleteClient,
} from "../../lib/admin-clients";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["", "active", "suspended", "terminated"];

export default function AdminClients() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: PAGE_SIZE, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Action states
  // activeDropdown: { id, client, top, bottom, right } | null
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'suspend' | 'delete' | 'reset-pwd'
  const [selectedClient, setSelectedClient] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
    role: "user",
  });

  const dropdownRef = useRef(null);

  // Close dropdown on outside click, window scroll, or resize
  useEffect(() => {
    function handleClose(e) {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
        return;
      }
      setActiveDropdown(null);
    }
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    document.addEventListener("mousedown", handleClose);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
      document.removeEventListener("mousedown", handleClose);
    };
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function showToast(type, message) {
    setToast({ type, message });
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getClients({
        page,
        per_page: PAGE_SIZE,
        q,
        status: statusFilter,
        sort_by: "created_at",
        sort_dir: "desc",
      });
      setData(res.data ?? []);
      setMeta(res.meta ?? { page, per_page: PAGE_SIZE, total: 0, total_pages: 0 });
    } catch (e) {
      setError("Gagal memuat data client.");
      setData([]);
      setMeta({ page, per_page: PAGE_SIZE, total: 0, total_pages: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  // --- ACTIONS ---

  // 1. Quick Activate / Verify
  async function handleQuickActivate(client) {
    if (client.status === "active") {
      showToast("info", `Akun ${client.name} sudah dalam status Aktif.`);
      return;
    }

    try {
      setActionLoading(true);
      await updateClientStatus(client.id, "active");
      setData((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, status: "active" } : c))
      );
      showToast("success", `Akun ${client.name} berhasil diaktifkan kembali!`);
    } catch (err) {
      showToast("error", err.message || "Gagal mengaktifkan client.");
    } finally {
      setActionLoading(false);
    }
  }

  // 2. Open Suspend Confirmation Modal
  function handleOpenSuspend(client) {
    setSelectedClient(client);
    setModalType("suspend");
    setActiveDropdown(null);
  }

  async function handleConfirmSuspend() {
    if (!selectedClient) return;
    const newStatus = selectedClient.status === "suspended" ? "active" : "suspended";
    try {
      setActionLoading(true);
      await updateClientStatus(selectedClient.id, newStatus);
      setData((prev) =>
        prev.map((c) => (c.id === selectedClient.id ? { ...c, status: newStatus } : c))
      );
      showToast(
        "success",
        newStatus === "suspended"
          ? `Akun ${selectedClient.name} berhasil ditangguhkan.`
          : `Akun ${selectedClient.name} berhasil diaktifkan kembali.`
      );
      setModalType(null);
      setSelectedClient(null);
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah status client.");
    } finally {
      setActionLoading(false);
    }
  }

  // 3. Open Delete Confirmation Modal
  function handleOpenDelete(client) {
    setSelectedClient(client);
    setModalType("delete");
    setActiveDropdown(null);
  }

  async function handleConfirmDelete(isTerminateOnly = false) {
    if (!selectedClient) return;
    try {
      setActionLoading(true);
      if (isTerminateOnly) {
        await updateClientStatus(selectedClient.id, "terminated");
        setData((prev) =>
          prev.map((c) => (c.id === selectedClient.id ? { ...c, status: "terminated" } : c))
        );
        showToast("success", `Akun ${selectedClient.name} ditandai sebagai Terminated.`);
      } else {
        await deleteClient(selectedClient.id);
        setData((prev) => prev.filter((c) => c.id !== selectedClient.id));
        setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        showToast("success", `Akun ${selectedClient.name} berhasil dihapus permanen.`);
      }
      setModalType(null);
      setSelectedClient(null);
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus client.");
    } finally {
      setActionLoading(false);
    }
  }

  // 4. Open Edit Modal
  function handleOpenEdit(client) {
    setSelectedClient(client);
    setClientForm({
      name: client.name,
      email: client.email,
      password: "",
      status: client.status,
      role: client.role,
    });
    setModalType("edit");
    setActiveDropdown(null);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      setActionLoading(true);
      const payload = {
        name: clientForm.name,
        email: clientForm.email,
        status: clientForm.status,
        role: clientForm.role,
      };
      if (clientForm.password.trim()) {
        payload.password = clientForm.password.trim();
      }

      const res = await updateClient(selectedClient.id, payload);
      const updated = res.data;
      setData((prev) => prev.map((c) => (c.id === selectedClient.id ? updated : c)));
      showToast("success", `Data akun ${updated.name} berhasil diperbarui!`);
      setModalType(null);
      setSelectedClient(null);
    } catch (err) {
      showToast("error", err.message || "Gagal memperbarui data client.");
    } finally {
      setActionLoading(false);
    }
  }

  // 5. Open Add Client Modal
  function handleOpenAdd() {
    setClientForm({
      name: "",
      email: "",
      password: "",
      status: "active",
      role: "user",
    });
    setModalType("add");
  }

  async function handleSaveAdd(e) {
    e.preventDefault();
    try {
      setActionLoading(true);
      await createClient(clientForm);
      showToast("success", `Client baru ${clientForm.name} berhasil ditambahkan!`);
      setModalType(null);
      load();
    } catch (err) {
      showToast("error", err.message || "Gagal menambahkan client.");
    } finally {
      setActionLoading(false);
    }
  }

  // 6. Quick Reset Password Modal
  function handleOpenResetPwd(client) {
    setSelectedClient(client);
    setClientForm({ password: "" });
    setModalType("reset-pwd");
    setActiveDropdown(null);
  }

  async function handleSaveResetPwd(e) {
    e.preventDefault();
    if (!selectedClient) return;
    if (!clientForm.password || clientForm.password.length < 6) {
      showToast("error", "Password minimal harus 6 karakter.");
      return;
    }

    try {
      setActionLoading(true);
      await updateClient(selectedClient.id, { password: clientForm.password });
      showToast("success", `Password untuk ${selectedClient.name} berhasil diubah!`);
      setModalType(null);
      setSelectedClient(null);
    } catch (err) {
      showToast("error", err.message || "Gagal mereset password.");
    } finally {
      setActionLoading(false);
    }
  }

  // 7. Direct Status Change from dropdown
  async function handleDirectStatus(client, newStatus) {
    setActiveDropdown(null);
    if (client.status === newStatus) return;
    try {
      setActionLoading(true);
      await updateClientStatus(client.id, newStatus);
      setData((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, status: newStatus } : c))
      );
      showToast("success", `Status akun ${client.name} diubah menjadi ${newStatus}.`);
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah status.");
    } finally {
      setActionLoading(false);
    }
  }

  // 8. Toggle Floating Dropdown menu with Auto-Flip
  function handleToggleDropdown(e, client) {
    e.stopPropagation();
    if (activeDropdown?.id === client.id) {
      setActiveDropdown(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 280; // approximate height
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setActiveDropdown({
      id: client.id,
      client,
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
      right: Math.max(12, window.innerWidth - rect.right),
    });
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
          {toast.type === "info" && <LockKey className="h-5 w-5 text-blue-400 shrink-0" />}
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
          <h1 className="text-2xl font-display font-bold text-slate-900">Clients Management</h1>
          <p className="text-sm text-slate-500">Kelola seluruh pengguna dan akun terdaftar di KiosHosting</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
            {meta.total} total clients
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4" weight="bold" />
            <span>Tambah Client</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 p-4">
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama atau email..."
              style={{ colorScheme: "light" }}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </form>

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
                className="bg-white py-1 pr-1 text-sm font-medium text-slate-700 outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "" ? "Semua Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs font-medium text-slate-400">
              Page {meta.page}/{meta.total_pages || 1}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Client Details</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <CircleNotch className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data clients...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="text-base font-semibold text-slate-700">Tidak ada client ditemukan</div>
                    <div className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status</div>
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                data.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Client Details */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.email}</div>
                      <div className="mt-1 text-[10px] font-mono text-slate-400">ID: {c.id}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          c.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : c.status === "suspended"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                            : "bg-red-50 text-red-700 border border-red-200/50"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            c.status === "active"
                              ? "bg-emerald-500"
                              : c.status === "suspended"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        ></span>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          c.role === "superadmin"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {c.role}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(c.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. Verify / Activate Button */}
                        <button
                          onClick={() => handleQuickActivate(c)}
                          disabled={actionLoading}
                          className={`p-2 rounded-lg transition-all ${
                            c.status === "active"
                              ? "text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100"
                              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={c.status === "active" ? "Akun sudah aktif" : "Aktifkan Akun"}
                        >
                          <CheckCircle className="h-5 w-5" weight={c.status === "active" ? "fill" : "regular"} />
                        </button>

                        {/* 2. Suspend / Unsuspend Button */}
                        <button
                          onClick={() => handleOpenSuspend(c)}
                          disabled={actionLoading}
                          className={`p-2 rounded-lg transition-all ${
                            c.status === "suspended"
                              ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                              : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          }`}
                          title={c.status === "suspended" ? "Buka Suspend (Aktifkan)" : "Tangguhkan (Suspend)"}
                        >
                          {c.status === "suspended" ? (
                            <LockKeyOpen className="h-5 w-5" weight="bold" />
                          ) : (
                            <LockKey className="h-5 w-5" />
                          )}
                        </button>

                        {/* 3. Terminate / Delete Button */}
                        <button
                          onClick={() => handleOpenDelete(c)}
                          disabled={actionLoading}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus / Terminate Client"
                        >
                          <Trash className="h-5 w-5" />
                        </button>

                        {/* 4. More Options Button */}
                        <button
                          onClick={(e) => handleToggleDropdown(e, c)}
                          className={`p-2 rounded-lg transition-all ${
                            activeDropdown?.id === c.id
                              ? "bg-slate-100 text-slate-900 ring-2 ring-blue-500/20"
                              : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                          title="Opsi Lainnya"
                        >
                          <DotsThree className="h-5 w-5" weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 px-6 py-4 gap-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {meta.total ? (meta.page - 1) * meta.per_page + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(meta.page * meta.per_page, meta.total)}
            </span>{" "}
            of <span className="font-semibold text-slate-900">{meta.total}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                page <= 1
                  ? "border-slate-200 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <CaretLeft className="h-4 w-4" /> Prev
            </button>
            {Array.from({ length: Math.min(meta.total_pages || 1, 5) }, (_, i) => {
              const totalPages = meta.total_pages || 1;
              let pNum;
              if (totalPages <= 5) pNum = i + 1;
              else if (page <= 3) pNum = i + 1;
              else if (page >= totalPages - 2) pNum = totalPages - 4 + i;
              else pNum = page - 2 + i;

              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    page === pNum
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(meta.total_pages || 1, p + 1))}
              disabled={page >= (meta.total_pages || 1)}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                page >= (meta.total_pages || 1)
                  ? "border-slate-200 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Next <CaretRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== FLOATING PORTAL DROPDOWN ===================== */}
      {/* Rendered with position: fixed so it NEVER gets clipped by overflow-x-auto or table bounds */}
      {activeDropdown && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: activeDropdown.top !== undefined ? `${activeDropdown.top}px` : undefined,
            bottom: activeDropdown.bottom !== undefined ? `${activeDropdown.bottom}px` : undefined,
            right: `${activeDropdown.right}px`,
            colorScheme: "light",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-[150] text-left animate-in fade-in zoom-in-95 duration-100 [color-scheme:light]"
        >
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Aksi Client
          </div>

          <button
            onClick={() => handleOpenEdit(activeDropdown.client)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors text-left"
          >
            <PencilSimple className="h-4 w-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
            <span>Edit Profil & Status</span>
          </button>

          <button
            onClick={() => handleOpenResetPwd(activeDropdown.client)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors text-left"
          >
            <Key className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Reset Password</span>
          </button>

          <div className="my-1.5 border-t border-slate-100"></div>
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ubah Cepat Status
          </div>

          <button
            onClick={() => handleDirectStatus(activeDropdown.client, "active")}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors text-left"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Set Active</span>
          </button>

          <button
            onClick={() => handleDirectStatus(activeDropdown.client, "suspended")}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors text-left"
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>
            <span>Set Suspended</span>
          </button>

          <button
            onClick={() => handleDirectStatus(activeDropdown.client, "terminated")}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-left"
          >
            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
            <span>Set Terminated</span>
          </button>

          <div className="my-1.5 border-t border-slate-100"></div>

          <button
            onClick={() => handleOpenDelete(activeDropdown.client)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
          >
            <Trash className="h-4 w-4 text-red-500 shrink-0" />
            <span>Hapus Akun</span>
          </button>
        </div>
      )}

      {/* ===================== MODALS ===================== */}

      {/* 1. Modal Tambah Client */}
      {modalType === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <UserPlus className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tambah Client Baru</h3>
                  <p className="text-xs text-slate-500">Daftarkan akun pengguna baru ke sistem</p>
                </div>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="cth. Budi Santoso"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="client@example.com"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password Awal
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={clientForm.password}
                  onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={clientForm.status}
                    onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Role
                  </label>
                  <select
                    value={clientForm.role}
                    onChange={(e) => setClientForm({ ...clientForm, role: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="user">User (Client)</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
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
                  <span>Simpan Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Edit Client */}
      {modalType === "edit" && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                  <PencilSimple className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit Client: {selectedClient.name}</h3>
                  <p className="text-xs text-slate-500">Perbarui informasi profil dan hak akses</p>
                </div>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={clientForm.status}
                    onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Role
                  </label>
                  <select
                    value={clientForm.role}
                    onChange={(e) => setClientForm({ ...clientForm, role: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  value={clientForm.password}
                  onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                  placeholder="Kosongkan jika tidak ingin ganti"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
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
                  <span>Perbarui Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Konfirmasi Suspend */}
      {modalType === "suspend" && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl mb-4 ${
                selectedClient.status === "suspended"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {selectedClient.status === "suspended" ? (
                <LockKeyOpen className="h-6 w-6" weight="bold" />
              ) : (
                <LockKey className="h-6 w-6" weight="bold" />
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {selectedClient.status === "suspended"
                ? "Buka Tangguhan (Unsuspend)?"
                : "Tangguhkan Akun Client?"}
            </h3>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {selectedClient.status === "suspended" ? (
                <>
                  Apakah Anda yakin ingin mengaktifkan kembali akun{" "}
                  <strong className="text-slate-900 font-semibold">{selectedClient.name}</strong>? Pengguna akan
                  dapat login dan mengakses layanannya kembali.
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin men-suspend akun{" "}
                  <strong className="text-slate-900 font-semibold">{selectedClient.name}</strong>? Pengguna tidak
                  akan dapat login atau mengakses layanan hingga diaktifkan kembali.
                </>
              )}
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmSuspend}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 transition-all ${
                  selectedClient.status === "suspended"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                <span>
                  {selectedClient.status === "suspended"
                    ? "Ya, Aktifkan Akun"
                    : "Ya, Suspend Akun"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal Konfirmasi Hapus */}
      {modalType === "delete" && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <Trash className="h-6 w-6" weight="bold" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Hapus Akun Client?</h3>

            <p className="mt-2 text-sm text-slate-600">
              Pilih tindakan untuk akun{" "}
              <strong className="text-slate-900 font-semibold">{selectedClient.name}</strong> (
              {selectedClient.email}):
            </p>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleConfirmDelete(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 shadow-sm disabled:opacity-50 transition-all"
              >
                {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                <span>Hapus Permanen Dari Database</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleConfirmDelete(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                <span>Tandai Sebagai Terminated Saja</span>
              </button>

              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-full rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Reset Password Cepat */}
      {modalType === "reset-pwd" && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Key className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Reset Password</h3>
                  <p className="text-xs text-slate-500">{selectedClient.name}</p>
                </div>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPwd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={clientForm.password}
                  onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 shadow-sm transition-all"
                >
                  {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <span>Simpan Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
