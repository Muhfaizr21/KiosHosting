import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, CreditCard, HardDrives, Users, TrendUp, TrendDown, Clock, GlobeHemisphereWest, ArrowUpRight, CheckCircle, Cpu } from "@phosphor-icons/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

const trafficData = [
  { name: '00:00', visitors: 120 },
  { name: '04:00', visitors: 80 },
  { name: '08:00', visitors: 450 },
  { name: '12:00', visitors: 980 },
  { name: '16:00', visitors: 850 },
  { name: '20:00', visitors: 600 },
  { name: '23:59', visitors: 300 },
];

const bandwidthData = [
  { name: 'Mon', in: 1.2, out: 3.4 },
  { name: 'Tue', in: 1.5, out: 2.8 },
  { name: 'Wed', in: 2.1, out: 4.5 },
  { name: 'Thu', in: 1.8, out: 3.9 },
  { name: 'Fri', in: 2.4, out: 5.1 },
  { name: 'Sat', in: 3.1, out: 6.2 },
  { name: 'Sun', in: 2.8, out: 5.8 },
];

const latencyData = [
  { name: '1m', ms: 45 },
  { name: '5m', ms: 52 },
  { name: '10m', ms: 48 },
  { name: '15m', ms: 120 },
  { name: '20m', ms: 42 },
  { name: '25m', ms: 38 },
  { name: '30m', ms: 41 },
];

const usageData = [
  { name: 'CPU', value: 45, max: 100, color: '#8b5cf6' },
  { name: 'RAM', value: 70, max: 100, color: '#ec4899' },
  { name: 'SSD', value: 30, max: 100, color: '#10b981' },
];

export default function Overview() {
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

      {/* Top Row: Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { t: "Layanan Aktif", v: "3 Paket", icon: HardDrives, color: "text-violet-600", bg: "bg-violet-50", trend: "+1 bulan ini", trendUp: true },
          { t: "Tagihan Belum Dibayar", v: "Rp 0", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Lunas semua", trendUp: true },
          { t: "Total Pengunjung", v: "24.5K", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12% dari minggu lalu", trendUp: true },
          { t: "Rata-rata Uptime", v: "99.99%", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.01% hari ini", trendUp: true },
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
        
        {/* Left Column: Charts Grid */}
        <div className="flex flex-col gap-6">
          
          {/* Traffic Chart (Full width of left col) */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Trafik Pengunjung (24 Jam)</h3>
                <p className="text-xs text-slate-500">example.com</p>
              </div>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="visitors" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Bandwidth Chart */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Network Traffic</h3>
                  <p className="text-xs text-slate-500">Inbound vs Outbound (GB)</p>
                </div>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bandwidthData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="in" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="out" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Latency Chart */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Server Latency</h3>
                  <p className="text-xs text-slate-500">Response time (ms)</p>
                </div>
              </div>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="ms" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Service Health / Resource Usage (How) */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <h3 className="mb-6 font-display text-base font-bold text-slate-900">Utilisasi Sumber Daya</h3>
            <div className="grid gap-6 sm:grid-cols-3">
              {usageData.map((item) => (
                <div key={item.name} className="flex flex-col">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Cards */}
        <div className="flex flex-col gap-6">
          
          {/* Server Info Card */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <h3 className="font-display text-base font-bold text-slate-900">Informasi Server</h3>
            <div className="mt-5 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <GlobeHemisphereWest className="h-5 w-5" weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Lokasi Data Center</p>
                  <p className="text-sm font-bold text-slate-900">Singapore (SG-1)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Status Keamanan</p>
                  <p className="text-sm font-bold text-slate-900">Protected by Imunify360</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Cpu className="h-5 w-5" weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Status Node</p>
                  <p className="text-sm font-bold text-slate-900">Online (Load: 0.14)</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-slate-100 pt-5">
              <Link to="/dashboard/service/1" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800">
                Kelola Server <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Active Services List */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">Layanan Aktif</h3>
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">2</span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { name: "Bisnis Pro", domain: "example.com", status: "Aktif" },
                { name: "Domain", domain: "example.com", status: "Aktif" },
              ].map((svc, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{svc.name}</p>
                    <p className="text-xs text-slate-500">{svc.domain}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-emerald-500" weight="fill" />
                </div>
              ))}
            </div>
            <Link to="/dashboard/service/1" className="mt-4 block text-center text-sm font-medium text-violet-600 hover:text-violet-700">
              Lihat semua layanan &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
