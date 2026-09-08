import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Globe, HardDrive, Cpu, ShieldCheck, ArrowSquareOut, Key, GearSix, Database, WarningCircle, ArrowLeft } from "@phosphor-icons/react";
import { meApi } from "../../lib/auth";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadService();
  }, [id]);

  async function loadService() {
    try {
      setLoading(true);
      const res = await meApi.serviceDetail(id);
      setService(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const diskPct = service && service.disk_limit
    ? Math.min(100, Math.round((service.disk_usage / service.disk_limit) * 100))
    : 0;
  const bwPct = service && service.bandwidth_limit
    ? Math.min(100, Math.round((service.bandwidth_usage / service.bandwidth_limit) * 100))
    : 0;

  const formatGb = (mb) => mb ? `${(mb / 1024).toFixed(1)} GB` : "-";

  const isActive = (service?.status || "").toLowerCase() === "active";

  return (
    <div className="w-full">
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Memuat detail layanan...</div>
      ) : !service ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-12 text-center">
          <WarningCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">Layanan tidak ditemukan</h3>
          <p className="mt-2 text-sm text-slate-500">{error || "Pastikan Anda memiliki akses ke layanan ini."}</p>
          <Link to="/dashboard/services" className="inline-block mt-4 text-sm font-bold text-violet-600 hover:text-violet-700">
            &larr; Kembali ke Layanan
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button onClick={() => window.history.back()} className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700">
                <ArrowLeft className="h-4 w-4" /> Kembali
              </button>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-bold text-slate-900">{service.plan}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {service.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{service.domain} • {service.server}</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`http://${service.ip_address || service.domain}:2083`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition-colors"
              >
                <ArrowSquareOut weight="bold" className="h-4 w-4" /> Login cPanel
              </a>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
              <WarningCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-8">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Globe weight="duotone" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Domain Utama</p>
                  <p className="font-semibold text-slate-900 break-all">{service.domain}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck weight="duotone" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">IP Server</p>
                  <p className="font-semibold text-slate-900">{service.ip_address}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] md:col-span-2">
              <p className="text-sm font-medium text-slate-500 mb-2">Nameservers</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 p-2 text-sm font-mono text-slate-700">{service.ns1 || "-"}</div>
                <div className="rounded-lg bg-slate-50 p-2 text-sm font-mono text-slate-700">{service.ns2 || "-"}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Resource Usage */}
            <div className="lg:col-span-2 space-y-8">
              {/* Disk Usage */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <HardDrive weight="duotone" className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">SSD Storage</h3>
                </div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">{formatGb(service.disk_usage)}</span>
                  <span className="text-slate-500">dari {formatGb(service.disk_limit)}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${diskPct}%` }}></div>
                </div>
              </div>

              {/* Bandwidth Usage */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CloudArrowSquareIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Bandwidth</h3>
                    <p className="text-xs text-slate-500">{formatGb(service.bandwidth_usage)} dipakai dari {formatGb(service.bandwidth_limit)}</p>
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${bwPct}%` }}></div>
                </div>
              </div>

              {!isActive && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                  <p className="font-semibold">Layanan ditangguhkan</p>
                  {service.suspend_reason && <p className="mt-1">{service.suspend_reason}</p>}
                </div>
              )}
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Tindakan Cepat</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Email", icon: <GearSix className="h-6 w-6" /> },
                    { label: "Database", icon: <Database className="h-6 w-6" /> },
                    { label: "cPanel", icon: <GearSix className="h-6 w-6" /> },
                  ].map((act, i) => (
                    <button key={i} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-violet-50 hover:border-violet-100 hover:text-violet-700 transition-colors text-slate-600">
                      {act.icon}
                      <span className="text-[11px] font-semibold">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-slate-900 p-6 text-white shadow-sm">
                <h3 className="font-semibold mb-2">Akses FTP/SSH</h3>
                <div className="space-y-3 mt-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Host</p>
                    <div className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-mono">{service.ip_address || service.domain}</div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Username</p>
                    <div className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-mono">{service.username || "-"}</div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Password</p>
                    <div className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm font-mono">
                      <span>{service.password_masked || "••••••••"}</span>
                      <Key className="h-4 w-4 text-violet-400" />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Hubungi support jika perlu reset password.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Perpanjangan Berikutnya</span>
                  <span className="font-semibold text-slate-900">{service.next_due || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// small inline icon, avoids extra import for the bandwidth card
function CloudArrowSquareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 18C4.2 18 2 15.8 2 13C2 10.2 4.2 8 7 8C7.5 5.5 9.7 4 12 4C14.3 4 16.5 5.5 17 8C20 8 22 10.5 22 13.5C22 16 20.5 18 18 18H7Z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.4"/>
      <path d="M12 17V11M12 11L9.5 13.5M12 11L14.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}