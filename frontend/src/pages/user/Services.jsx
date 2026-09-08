import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe, ShieldCheck, HardDrives, CloudArrowUp, CaretRight, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { meApi } from "../../lib/auth";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const res = await meApi.services();
      setServices(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "active") {
      return (
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">Aktif</span>
      );
    }
    if (s === "suspended" || s === "suspend") {
      return (
        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">Ditangguhkan</span>
      );
    }
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">{status}</span>
    );
  };

  const formatGb = (mb) => {
    if (!mb) return "-";
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Layanan Saya</h2>
          <p className="mt-1 text-sm text-slate-500">Kelola website, DNS, dan domain per paket.</p>
        </div>
        <Link to="/#pricing" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition-colors">
          <CloudArrowUp className="h-4 w-4" /> Pesan Layanan
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <WarningCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Memuat layanan...</div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-12 text-center">
          <HardDrives className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">Belum ada layanan</h3>
          <p className="mt-2 text-sm text-slate-500">Pilih paket hosting untuk memulai.</p>
          <Link to="/#pricing" className="mt-4 inline-block rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-violet-700">
            Lihat Paket
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_350px]">
          <div className="grid gap-4">
            {services.map((srv) => (
              <Link key={srv.id} to={`/dashboard/service/${srv.id}`} className="block rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-slate-900">{srv.domain}</p>
                    <p className="text-sm text-slate-500">{srv.id} · {srv.plan}</p>
                  </div>
                  {statusBadge(srv.status)}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    [Globe, "Domain", srv.domain],
                    [HardDrives, "Disk", formatGb(srv.disk_limit)],
                    [CloudArrowUp, "Bandwidth", formatGb(srv.bandwidth_limit)],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <Icon className="h-5 w-5 text-slate-500" />
                      <p className="mt-3 text-sm text-slate-500">{label}</p>
                      <p className="mt-1 font-semibold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <HardDrives className="h-4 w-4" /> Buka Panel
                  </button>
                  <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Kelola DNS <CaretRight className="h-4 w-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <p className="font-display text-lg font-semibold text-slate-900">Ringkasan</p>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Layanan Aktif</span>
                  <span className="font-semibold text-slate-900">{services.filter(s => s.status === 'Active' || s.status === 'active').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Disk</span>
                  <span className="font-semibold text-slate-900">{formatGb(services.reduce((a, s) => a + (s.disk_limit || 0), 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Penggunaan Disk</span>
                  <span className="font-semibold text-slate-900">{formatGb(services.reduce((a, s) => a + (s.disk_usage || 0), 0))}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-violet-900 p-6 text-white shadow-sm">
              <p className="font-display text-lg font-semibold">Tips Layanan</p>
              <ul className="mt-3 space-y-3 text-sm text-violet-200">
                <li>1. Domain aktif dan pointing benar.</li>
                <li>2. SSL terpasang dan backup berjalan.</li>
                <li>3. Panel pelanggan siap dipakai.</li>
                <li>4. Support dihubungi jika ada error.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
