import React from "react";
import { Globe, HardDrive, Cpu, ShieldCheck, ArrowSquareOut, Key, GearSix, GitBranch, Database, FileCode } from "@phosphor-icons/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ServiceDetail() {
  const bandwidthData = [
    { name: "1 Sep", gb: 1.2 },
    { name: "2 Sep", gb: 2.1 },
    { name: "3 Sep", gb: 1.8 },
    { name: "4 Sep", gb: 3.4 },
    { name: "5 Sep", gb: 2.8 },
    { name: "6 Sep", gb: 4.1 },
    { name: "7 Sep", gb: 3.9 },
  ];

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-slate-900">Bisnis Pro</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Aktif</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">example.com • Jakarta (ID) Server</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition-colors">
            <ArrowSquareOut weight="bold" className="h-4 w-4" /> Login cPanel
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Globe weight="duotone" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Domain Utama</p>
              <p className="font-semibold text-slate-900">example.com</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck weight="duotone" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">IP Server (Dedicated)</p>
              <p className="font-semibold text-slate-900">103.82.24.19</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] md:col-span-2">
          <div className="flex items-center gap-3 mb-1">
            <p className="text-sm font-medium text-slate-500">Nameservers</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="rounded-lg bg-slate-50 p-2 text-sm font-mono text-slate-700">ns1.kioshosting.com</div>
            <div className="rounded-lg bg-slate-50 p-2 text-sm font-mono text-slate-700">ns2.kioshosting.com</div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Resource Usage Charts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Penggunaan Bandwidth</h3>
                <p className="text-sm text-slate-500">Bulan ini: 19.3 GB / Unlimited</p>
              </div>
              <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bandwidthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#8b5cf6', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="gb" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGb)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <HardDrive weight="duotone" className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">SSD Storage</h3>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">12.5 GB</span>
                <span className="text-slate-500">dari 50 GB</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Cpu weight="duotone" className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">RAM / CPU</h3>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">Rata-rata 35%</span>
                <span className="text-slate-500">Normal</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Tindakan Cepat</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Email", icon: "envelope" },
                { label: "File Manager", icon: "folder" },
                { label: "Database", icon: "database" },
                { label: "PHP Select", icon: "code" },
                { label: "DNS Zone", icon: "globe" },
                { label: "Git", icon: "git" },
              ].map((act, i) => (
                <button key={i} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-violet-50 hover:border-violet-100 hover:text-violet-700 transition-colors text-slate-600">
                  {act.icon === 'database' ? <Database className="h-6 w-6" /> : 
                   act.icon === 'code' ? <FileCode className="h-6 w-6" /> :
                   act.icon === 'globe' ? <Globe className="h-6 w-6" /> :
                   act.icon === 'git' ? <GitBranch className="h-6 w-6" /> :
                   <GearSix className="h-6 w-6" />}
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
                <div className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-mono">103.82.24.19</div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Username</p>
                <div className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-mono">examplec</div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Password</p>
                <div className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm font-mono">
                  •••••••• 
                  <button className="text-violet-400 hover:text-violet-300"><Key className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
