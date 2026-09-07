import React from "react";
import { ShieldCheck, ShieldWarning, Prohibit, Globe, Cloud, Eye } from "@phosphor-icons/react";

export default function AdminSecurity() {
  const blocks = [
    { ip: "192.168.1.45", reason: "SSH Brute Force", source: "Fail2ban", time: "10 mins ago", node: "JKT-01" },
    { ip: "45.33.12.99", reason: "Multiple Failed Logins", source: "Fail2ban", time: "1 hour ago", node: "JKT-02" },
    { ip: "203.0.113.5", reason: "SQL Injection Attempt", source: "ModSecurity", time: "2 hours ago", node: "JKT-01" },
    { ip: "198.51.100.22", reason: "DDoS Activity", source: "Cloudflare", time: "5 hours ago", node: "Global" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Security & WAF</h1>
          <p className="text-sm text-slate-500">Monitor threats, blocked IPs, and Cloudflare integration</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-600" weight="fill" />
            <div>
              <p className="text-sm font-medium text-emerald-800">System Status</p>
              <p className="font-bold text-emerald-900">Protected</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Blocked IPs</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900">1,245</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Threats</p>
          <p className="mt-1 font-display text-2xl font-bold text-red-600">3</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Cloudflare API</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600">Synced</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-display text-lg font-bold text-slate-900">Recent Blocked Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">IP Address</th>
                  <th className="px-6 py-4 font-semibold">Reason</th>
                  <th className="px-6 py-4 font-semibold">Source / Node</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blocks.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{b.ip}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-100">
                        <ShieldWarning className="h-3.5 w-3.5" weight="bold" />
                        {b.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{b.source}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">{b.node}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{b.time}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">Unban</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Prohibit className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-slate-900">Ban IP Address</span>
                </div>
              </button>
              <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Cloud className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold text-slate-900">Clear CF Cache</span>
                </div>
              </button>
              <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-slate-900">Enable Under Attack</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
