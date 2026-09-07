import React, { useState, useEffect } from "react";
import {
  Plus,
  Tag,
  GlobeHemisphereWest,
  PencilSimple,
  Trash,
  CheckCircle,
  Warning,
  X,
  CircleNotch,
  Cpu,
  HardDrive,
  Users,
} from "@phosphor-icons/react";
import { api } from "../../lib/auth";

export default function AdminProducts() {
  const [plans, setPlans] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals state
  const [modalType, setModalType] = useState(null); // 'plan-create' | 'plan-edit' | 'plan-delete' | 'domain-create' | 'domain-edit' | 'domain-delete'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);

  // Plan Form
  const [planForm, setPlanForm] = useState({
    name: "",
    price: "",
    cycle: "monthly",
    disk: "10 GB NVMe",
    cpu: "1 Core",
    ram: "1 GB",
    bandwidth: "Unlimited",
    status: "Active",
  });

  // Domain Form
  const [domainForm, setDomainForm] = useState({
    tld: "",
    register: "",
    renew: "",
    transfer: "",
    active: true,
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

  async function loadData() {
    setLoading(true);
    try {
      const [plansRes, domainsRes] = await Promise.all([
        api("GET", "/admin/products/plans"),
        api("GET", "/admin/products/domains"),
      ]);
      setPlans(Array.isArray(plansRes) ? plansRes : []);
      setDomains(Array.isArray(domainsRes) ? domainsRes : []);
    } catch (err) {
      console.error("Gagal memuat data produk:", err);
      showToast("error", "Gagal memuat data produk & domain.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // --- PLAN HANDLERS ---
  const handleOpenAddPlan = () => {
    setPlanForm({
      name: "",
      price: "",
      cycle: "monthly",
      disk: "10 GB NVMe",
      cpu: "1 Core",
      ram: "1 GB",
      bandwidth: "Unlimited",
      status: "Active",
    });
    setModalType("plan-create");
  };

  const handleOpenEditPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      price: plan.price,
      cycle: plan.cycle || "monthly",
      disk: plan.disk,
      cpu: plan.cpu || "1 Core",
      ram: plan.ram || "1 GB",
      bandwidth: plan.bandwidth || "Unlimited",
      status: plan.status || "Active",
    });
    setModalType("plan-edit");
  };

  const handleOpenDeletePlan = (plan) => {
    setSelectedPlan(plan);
    setModalType("plan-delete");
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    const numPrice = parseFloat(planForm.price);
    if (!numPrice || numPrice <= 0) {
      showToast("error", "Harga paket harus lebih dari 0.");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        name: planForm.name,
        price: numPrice,
        cycle: planForm.cycle,
        disk: planForm.disk,
        cpu: planForm.cpu,
        ram: planForm.ram,
        bandwidth: planForm.bandwidth,
        status: planForm.status,
      };

      if (modalType === "plan-create") {
        const res = await api("POST", "/admin/products/plans", payload);
        setPlans((prev) => [...prev, res.data]);
        showToast("success", `Paket ${planForm.name} berhasil ditambahkan!`);
      } else if (modalType === "plan-edit" && selectedPlan) {
        const res = await api("PUT", `/admin/products/plans/${selectedPlan.id}`, payload);
        setPlans((prev) => prev.map((p) => (p.id === selectedPlan.id ? res.data : p)));
        showToast("success", `Paket ${res.data.name} berhasil diperbarui!`);
      }

      setModalType(null);
      setSelectedPlan(null);
    } catch (err) {
      showToast("error", err.message || "Gagal menyimpan paket hosting.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeletePlan = async () => {
    if (!selectedPlan) return;
    try {
      setActionLoading(true);
      await api("DELETE", `/admin/products/plans/${selectedPlan.id}`);
      setPlans((prev) => prev.filter((p) => p.id !== selectedPlan.id));
      showToast("success", `Paket ${selectedPlan.name} berhasil dihapus.`);
      setModalType(null);
      setSelectedPlan(null);
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus paket hosting.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- DOMAIN TLD HANDLERS ---
  const handleOpenAddDomain = () => {
    setDomainForm({
      tld: "",
      register: "",
      renew: "",
      transfer: "",
      active: true,
    });
    setModalType("domain-create");
  };

  const handleOpenEditDomain = (domain) => {
    setSelectedDomain(domain);
    setDomainForm({
      tld: domain.tld,
      register: domain.register,
      renew: domain.renew,
      transfer: domain.transfer,
      active: domain.active,
    });
    setModalType("domain-edit");
  };

  const handleOpenDeleteDomain = (domain) => {
    setSelectedDomain(domain);
    setModalType("domain-delete");
  };

  const handleSaveDomain = async (e) => {
    e.preventDefault();
    const reg = parseFloat(domainForm.register);
    const ren = parseFloat(domainForm.renew);
    const tra = parseFloat(domainForm.transfer);

    if (!reg || !ren || !tra) {
      showToast("error", "Semua harga pendaftaran, perpanjangan, dan transfer wajib diisi.");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        tld: domainForm.tld,
        register: reg,
        renew: ren,
        transfer: tra,
        active: domainForm.active,
      };

      if (modalType === "domain-create") {
        const res = await api("POST", "/admin/products/domains", payload);
        setDomains((prev) => [...prev, res.data]);
        showToast("success", `TLD ${res.data.tld} berhasil ditambahkan!`);
      } else if (modalType === "domain-edit" && selectedDomain) {
        const res = await api("PUT", `/admin/products/domains/${selectedDomain.id}`, payload);
        setDomains((prev) => prev.map((d) => (d.id === selectedDomain.id ? res.data : d)));
        showToast("success", `TLD ${res.data.tld} berhasil diperbarui!`);
      }

      setModalType(null);
      setSelectedDomain(null);
    } catch (err) {
      showToast("error", err.message || "Gagal menyimpan TLD domain.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDomain = async (domain) => {
    try {
      const res = await api("PUT", `/admin/products/domains/${domain.id}/toggle`);
      setDomains((prev) =>
        prev.map((d) => (d.id === domain.id ? { ...d, active: res.active } : d))
      );
      showToast(
        "success",
        `TLD ${domain.tld} ${res.active ? "diaktifkan" : "dinonaktifkan"}.`
      );
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah status aktif TLD.");
    }
  };

  const handleConfirmDeleteDomain = async () => {
    if (!selectedDomain) return;
    try {
      setActionLoading(true);
      await api("DELETE", `/admin/products/domains/${selectedDomain.id}`);
      setDomains((prev) => prev.filter((d) => d.id !== selectedDomain.id));
      showToast("success", `TLD ${selectedDomain.tld} berhasil dihapus.`);
      setModalType(null);
      setSelectedDomain(null);
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus TLD domain.");
    } finally {
      setActionLoading(false);
    }
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
          {toast.type === "info" && <Tag className="h-5 w-5 text-blue-400 shrink-0" weight="bold" />}
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
          <h1 className="text-2xl font-display font-bold text-slate-900">Products & Pricing</h1>
          <p className="text-sm text-slate-500">Kelola paket hosting, lisensi cloud, harga domain TLD, dan matriks harga</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <CircleNotch className="h-8 w-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat paket hosting & domain...</p>
        </div>
      ) : (
        <>
          {/* ===================== HOSTING PLANS SECTION ===================== */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Tag className="h-5 w-5" weight="duotone" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-900">Hosting Packages</h2>
                  <p className="text-xs text-slate-500">{plans.length} paket aktif tersedia untuk klien</p>
                </div>
              </div>
              <button
                onClick={handleOpenAddPlan}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
              >
                <Plus className="h-4 w-4" weight="bold" />
                <span>Tambah Paket</span>
              </button>
            </div>

            {plans.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Belum ada paket hosting. Klik "Tambah Paket" untuk membuat paket pertama.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-slate-900 text-base">{plan.name}</h3>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            plan.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {plan.status}
                        </span>
                      </div>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-display font-extrabold text-slate-900">
                          Rp {Number(plan.price).toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs font-medium text-slate-500">/{plan.cycle}</span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <HardDrive className="h-3.5 w-3.5 text-slate-400" /> Disk:
                          </span>
                          <span className="font-semibold text-slate-900">{plan.disk}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Cpu className="h-3.5 w-3.5 text-slate-400" /> CPU & RAM:
                          </span>
                          <span className="font-semibold text-slate-900">
                            {plan.cpu || "1 Core"} / {plan.ram || "1 GB"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Users className="h-3.5 w-3.5 text-slate-400" /> Active Clients:
                          </span>
                          <span className="font-semibold text-blue-600">{plan.clients || 0} akun</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEditPlan(plan)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        <PencilSimple className="h-4 w-4 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleOpenDeletePlan(plan)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                        title="Hapus Paket"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ===================== DOMAINS TLD SECTION ===================== */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <GlobeHemisphereWest className="h-5 w-5" weight="duotone" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-900">TLD Pricing</h2>
                  <p className="text-xs text-slate-500">Daftar harga registrasi, perpanjangan, dan transfer domain</p>
                </div>
              </div>
              <button
                onClick={handleOpenAddDomain}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
              >
                <Plus className="h-4 w-4" weight="bold" />
                <span>Tambah TLD</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Ekstensi</th>
                    <th className="px-6 py-4 font-semibold">Registrasi (1 Thn)</th>
                    <th className="px-6 py-4 font-semibold">Perpanjangan (1 Thn)</th>
                    <th className="px-6 py-4 font-semibold">Transfer</th>
                    <th className="px-6 py-4 font-semibold">Status Aktif</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {domains.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Belum ada data domain TLD.
                      </td>
                    </tr>
                  ) : (
                    domains.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1 font-mono font-bold text-slate-900 text-sm border border-slate-200">
                            {d.tld}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          Rp {Number(d.register).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          Rp {Number(d.renew).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          Rp {Number(d.transfer).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={d.active}
                              onChange={() => handleToggleDomain(d)}
                              className="peer sr-only"
                            />
                            <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditDomain(d)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleOpenDeleteDomain(d)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ===================== MODALS ===================== */}

      {/* 1. Modal Add / Edit Hosting Plan */}
      {(modalType === "plan-create" || modalType === "plan-edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Tag className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {modalType === "plan-create" ? "Tambah Paket Hosting" : `Edit Paket: ${selectedPlan?.name}`}
                  </h3>
                  <p className="text-xs text-slate-500">Konfigurasi spesifikasi dan harga paket</p>
                </div>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Paket
                </label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="cth. Cloud VPS Standard"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Harga (IDR)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    placeholder="cth. 45000"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Siklus Tagihan
                  </label>
                  <select
                    value={planForm.cycle}
                    onChange={(e) => setPlanForm({ ...planForm, cycle: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="monthly">Bulanan (monthly)</option>
                    <option value="yearly">Tahunan (yearly)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Disk Storage
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.disk}
                    onChange={(e) => setPlanForm({ ...planForm, disk: e.target.value })}
                    placeholder="cth. 20 GB NVMe"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    CPU Core
                  </label>
                  <input
                    type="text"
                    value={planForm.cpu}
                    onChange={(e) => setPlanForm({ ...planForm, cpu: e.target.value })}
                    placeholder="cth. 2 Core"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    RAM
                  </label>
                  <input
                    type="text"
                    value={planForm.ram}
                    onChange={(e) => setPlanForm({ ...planForm, ram: e.target.value })}
                    placeholder="cth. 2 GB"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Bandwidth
                  </label>
                  <input
                    type="text"
                    value={planForm.bandwidth}
                    onChange={(e) => setPlanForm({ ...planForm, bandwidth: e.target.value })}
                    placeholder="cth. Unlimited"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={planForm.status}
                    onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Active">Active (Tersedia)</option>
                    <option value="Inactive">Inactive (Disembunyikan)</option>
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
                  <span>{modalType === "plan-create" ? "Simpan Paket" : "Perbarui Paket"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Delete Hosting Plan */}
      {modalType === "plan-delete" && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <Trash className="h-6 w-6" weight="bold" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Hapus Paket Hosting?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus paket{" "}
              <strong className="text-slate-900">{selectedPlan.name}</strong>? Tindakan ini tidak dapat dibatalkan.
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
                onClick={handleConfirmDeletePlan}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                <span>Ya, Hapus Paket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Add / Edit Domain TLD */}
      {(modalType === "domain-create" || modalType === "domain-edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <GlobeHemisphereWest className="h-5 w-5" weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {modalType === "domain-create" ? "Tambah TLD Domain" : `Edit TLD: ${selectedDomain?.tld}`}
                  </h3>
                  <p className="text-xs text-slate-500">Konfigurasi harga registrasi dan perpanjangan ekstensi</p>
                </div>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDomain} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Ekstensi Domain (TLD)
                </label>
                <input
                  type="text"
                  required
                  value={domainForm.tld}
                  onChange={(e) => setDomainForm({ ...domainForm, tld: e.target.value })}
                  placeholder="cth. .id atau .com"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Harga Registrasi (1 Tahun)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={domainForm.register}
                  onChange={(e) => setDomainForm({ ...domainForm, register: e.target.value })}
                  placeholder="cth. 165000"
                  style={{ colorScheme: "light" }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Harga Perpanjangan
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={domainForm.renew}
                    onChange={(e) => setDomainForm({ ...domainForm, renew: e.target.value })}
                    placeholder="cth. 175000"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Harga Transfer
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={domainForm.transfer}
                    onChange={(e) => setDomainForm({ ...domainForm, transfer: e.target.value })}
                    placeholder="cth. 165000"
                    style={{ colorScheme: "light" }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={domainForm.active}
                    onChange={(e) => setDomainForm({ ...domainForm, active: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Aktifkan untuk pemesanan publik</span>
                </label>
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
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 shadow-sm transition-all"
                >
                  {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                  <span>{modalType === "domain-create" ? "Simpan TLD" : "Perbarui TLD"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Delete Domain TLD */}
      {modalType === "domain-delete" && selectedDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in [color-scheme:light]">
          <div
            style={{ colorScheme: "light" }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center text-slate-900"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
              <Trash className="h-6 w-6" weight="bold" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Hapus Ekstensi TLD?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus ekstensi domain{" "}
              <strong className="text-slate-900 font-mono">{selectedDomain.tld}</strong>?
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
                onClick={handleConfirmDeleteDomain}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {actionLoading && <CircleNotch className="h-4 w-4 animate-spin" />}
                <span>Ya, Hapus TLD</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
