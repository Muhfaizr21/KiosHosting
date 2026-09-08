import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, CreditCard, HardDrives, Users, TrendUp, TrendDown, Clock, GlobeHemisphereWest, ArrowUpRight, CheckCircle, Cpu, WarningCircle } from "@phosphor-icons/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { meApi } from "../../lib/auth";

export default function Overview() {
  const [services, setServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [srvRes, invRes] = await Promise.allSettled([
          meApi.services(),
          meApi.invoices({ limit: 5 })
        ]);
        if (srvRes.status === "fulfilled") setServices(srvRes.value.data || []);
        if (invRes.status === "fulfilled") setInvoices(invRes.value.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeServices = services.filter(s => s.status === "Active" || s.status === "active");
  const unpaidInvoices = invoices.filter(i => i.status === "Unpaid" || i.status === "Overdue" || i.status === "unpaid");
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  // Derive aggregate disk/bandwidth usage from real services
  const totalDiskUsage = services.reduce((sum, s) => sum + (s.disk_usage || 0), 0);
  const totalDiskLimit = services.reduce((sum, s) => sum + (s.disk_limit || 0), 0) || 1;
  const diskPct = Math.min(100, Math.round((totalDiskUsage / totalDiskLimit) * 100));

  const totalBwUsage = services.reduce((sum, s) => sum + (s.bandwidth_usage || 0), 0);
  const totalBwLimit = services.reduce((sum, s) => sum + (s.bandwidth_limit || 0), 0) || 1;
  const bwPct = Math.min(100, Math.round((totalBwUsage / totalBwLimit) * 100));

  const primaryService = services[0] || null;

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Pantau performa layanan dan aktivitas akun Anda secara real-time.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 border border-emerald-100">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-emerald-700">Semua Sistem Normal</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <WarningCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Row: Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            t: "Layanan Aktif",
            v: loading ? "..." : `${activeServices.length} Paket`,
            icon: HardDrives,
            color: "text-violet-600",
            bg: "bg-violet-50",
            trend: `${services.length} total layanan`,
            trendUp: true
          },
          {
            t: "Tagihan Belum Dibayar",
            v: loading ? "..." : `Rp ${totalUnpaid.toLocaleString("id-ID")}`,
            icon: CreditCard,
            color: unpaidInvoices.length > 0 ? "text-amber-600" : "text-emerald-600",
            bg: unpaidInvoices.length > 0 ? "bg-amber-50" : "bg-emerald-50",
            trend: unpaidInvoices.length > 0 ? `${unpaidInvoices.length} invoice menunggu` : "Lunas semua",
            trendUp: unpaidInvoices.length === 0
          },
          {
            t: "Total Disk",
            v: loading ? "..." : `${(totalDiskUsage / 1024).toFixed(1)} GB`,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            trend: `${diskPct}% dari kuota`,
            trendUp: diskPct < 80
          },
          {
            t: "Status Server",
            v: "Online",
            icon: Clock,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            trend: "99.9% Uptime",
            trendUp: true
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.08)]">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon weight="duotone" className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{s.t}</p>
                  <p className="font-display text-xl font-bold tracking-tight text-slate-900">{s.v}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                {s.trendUp ? <TrendUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendDown className="h-3.5 w-3.5 text-red-500" />}
                <span>{s.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Left Column: Resource Usage & Active Service Detail */}
        <div className="flex flex-col gap-6">
          {/* Resource Usage Breakdown */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <h3 className="mb-6 font-display text-base font-bold text-slate-900">Utilisasi Sumber Daya</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Disk Storage</span>
                  <span className="text-sm font-bold text-violet-600">{diskPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all duration-1000"
                    style={{ width: `${diskPct}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-slate-400">{(totalDiskUsage / 1024).toFixed(1)} GB dari {(totalDiskLimit / 1024).toFixed(1)} GB</p>
              </div>

              <div className="flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Bandwidth</span>
                  <span className="text-sm font-bold text-emerald-600">{bwPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-1000"
                    style={{ width: `${bwPct}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-slate-400">{(totalBwUsage / 1024).toFixed(1)} GB dari {(totalBwLimit / 1024).toFixed(1)} GB</p>
              </div>
            </div>
          </div>

          {/* Unpaid Invoices Table (if any) */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">Tagihan Terbaru</h3>
              <Link to="/dashboard/billing" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                Lihat semua &rarr;
              </Link>
            </div>
            {invoices.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada tagihan.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {invoices.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Invoice #{inv.id}</p>
                      <p className="text-xs text-slate-400">Jatuh tempo: {inv.due}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">Rp {Number(inv.amount).toLocaleString("id-ID")}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        inv.status === "Paid" || inv.status === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar Cards */}
        <div className="flex flex-col gap-6">
          {/* Server Info Card */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <h3 className="font-display text-base font-bold text-slate-900">Informasi Layanan Utama</h3>
            {primaryService ? (
              <div className="mt-5 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <GlobeHemisphereWest className="h-5 w-5" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Domain</p>
                    <p className="text-sm font-bold text-slate-900">{primaryService.domain}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-5 w-5" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Paket Hosting</p>
                    <p className="text-sm font-bold text-slate-900">{primaryService.plan || "Shared Hosting"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Cpu className="h-5 w-5" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Server</p>
                    <p className="text-sm font-bold text-slate-900">{primaryService.server || "Primary Node"}</p>
                  </div>
                </div>
                <div className="mt-2 border-t border-slate-100 pt-4">
                  <Link to={`/dashboard/service/${primaryService.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800">
                    Kelola Layanan <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-5 text-center py-6">
                <p className="text-sm text-slate-400">Belum ada layanan aktif.</p>
                <Link to="/#pricing" className="mt-3 inline-block text-xs font-bold text-violet-600 hover:text-violet-700">
                  Pesan Layanan Sekarang &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Active Services List */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">Layanan Anda</h3>
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">{services.length}</span>
            </div>
            {services.length === 0 ? (
              <p className="text-sm text-slate-400 py-3 text-center">Belum ada layanan terdaftar.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {services.slice(0, 3).map((svc) => (
                  <Link key={svc.id} to={`/dashboard/service/${svc.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{svc.domain}</p>
                      <p className="text-xs text-slate-500">{svc.plan}</p>
                    </div>
                    <CheckCircle className={`h-5 w-5 ${svc.status === 'Active' || svc.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`} weight="fill" />
                  </Link>
                ))}
              </div>
            )}
            {services.length > 3 && (
              <Link to="/dashboard/services" className="mt-4 block text-center text-sm font-medium text-violet-600 hover:text-violet-700">
                Lihat semua layanan ({services.length}) &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
