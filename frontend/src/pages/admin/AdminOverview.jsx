import React from "react";
import { Users, CreditCard, HardDrives, ShieldCheck, TrendUp, ArrowUpRight, ChartPieSlice } from "@phosphor-icons/react";
import { getUsers } from "../../lib/auth";

export default function AdminOverview() {
  const users = getUsers();

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { t: "Total Revenue", v: "Rp 12.5M", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50", trend: "+12.5%" },
          { t: "Active Clients", v: users.filter((u) => u.role === "user").length.toString(), icon: Users, color: "text-cyan-600", bg: "bg-cyan-50", trend: "+4.2%" },
          { t: "Server Nodes", v: "3 Active", icon: HardDrives, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Stable" },
          { t: "System Health", v: "99.9%", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", trend: "Perfect" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.t} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
                  <Icon weight="duotone" className="h-6 w-6" />
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {s.trend !== "Stable" && s.trend !== "Perfect" && <TrendUp className="h-3 w-3" />}
                  {s.trend}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{s.t}</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-900">{s.v}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Area Placeholder */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Revenue Growth</h2>
              <p className="text-sm text-slate-500">Monthly recurring revenue over time</p>
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 border-dashed">
            <div className="text-center">
              <ChartPieSlice className="mx-auto h-8 w-8 text-slate-400" weight="duotone" />
              <p className="mt-2 text-sm font-medium text-slate-500">Chart rendering area</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[
              { title: "New order placed", desc: "Premium Hosting 1 Year", time: "5 mins ago", dot: "bg-blue-500" },
              { title: "Invoice paid", desc: "INV-2024-001 - Rp 1.500.000", time: "2 hours ago", dot: "bg-emerald-500" },
              { title: "Support ticket opened", desc: "Issue with SSL certificate", time: "4 hours ago", dot: "bg-amber-500" },
              { title: "Server high load alert", desc: "Node-1 reached 85% CPU", time: "1 day ago", dot: "bg-red-500" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 shrink-0 rounded-full ${activity.dot} ring-4 ring-white`}></div>
                  {i !== 3 && <div className="h-full w-px bg-slate-200 mt-2"></div>}
                </div>
                <div className="pb-6 last:pb-0">
                  <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{activity.desc}</p>
                  <p className="mt-1 text-[10px] font-medium text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Users */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Recent Users</h2>
            <p className="text-sm text-slate-500">Users who recently signed up</p>
          </div>
          <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            View All <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.slice(0, 5).map((u, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${u.role === "superadmin" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


