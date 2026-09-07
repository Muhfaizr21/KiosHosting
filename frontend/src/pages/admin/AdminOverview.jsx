import React, { useState, useEffect } from "react";
import { Users, CreditCard, HardDrives, ShieldCheck, TrendUp, ArrowUpRight, Lifebuoy, Lightning, CircleNotch } from "@phosphor-icons/react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { api, getUsers } from "../../lib/auth";

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api("GET", "/admin/dashboard");
        if (response.error) {
          setError(response.error);
        } else {
          setData(response);
        }
      } catch (err) {
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <CircleNotch weight="bold" className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-red-100 p-3">
          <ShieldCheck weight="duotone" className="h-8 w-8 text-red-600" />
        </div>
        <p className="text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }

  const charts = data?.charts || {};
  const metrics = data?.metrics || {};

  const revenueData = charts.revenue || [];
  const clientData = charts.clients || [];
  const serverLoadData = charts.server || [];
  const ticketData = charts.tickets || [];
  const bandwidthData = charts.bandwidth || [];
  const activeClients = metrics.active_clients ?? 0;
  const recentUsers = data?.recent_users || [];
  const recentActivity = data?.recent_activity || [];

  return (
    <div className="space-y-6">
      {/* Metrics Row (5W1H Comprehensive Strategy) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { t: "Total Revenue", v: metrics.total_revenue || "Rp 0", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50", trend: "+12.5%" },     // WHAT
          { t: "Active Clients", v: activeClients.toString(), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+4.2%" }, // WHO
          { t: "Server Nodes", v: metrics.server_nodes || "0", icon: HardDrives, color: "text-violet-600", bg: "bg-violet-50", trend: "Stable" },  // WHERE
          { t: "Uptime Health", v: metrics.uptime_health || "0%", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Perfect" }, // WHEN
          { t: "Open Tickets", v: metrics.open_tickets || "0", icon: Lifebuoy, color: "text-amber-600", bg: "bg-amber-50", trend: "-2.1%" },              // WHY
          { t: "Conversion", v: metrics.conversion || "0%", icon: Lightning, color: "text-cyan-600", bg: "bg-cyan-50", trend: "+1.2%" },               // HOW
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.t} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
                  <Icon weight="duotone" className="h-5 w-5" />
                </div>
                {s.trend !== "Stable" && s.trend !== "Perfect" && (
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${s.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                    <TrendUp className={`h-2.5 w-2.5 ${s.trend.startsWith('-') ? 'rotate-180' : ''}`} />
                    {s.trend}
                  </span>
                )}
                {(s.trend === "Stable" || s.trend === "Perfect") && (
                   <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                     {s.trend}
                   </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500 line-clamp-1">{s.t}</p>
                <p className="mt-0.5 font-display text-xl font-bold text-slate-900">{s.v}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Area: Top 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Revenue Growth */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Revenue Growth</h2>
              <p className="text-sm text-slate-500">Monthly recurring revenue (MRR)</p>
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `Rp${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '14px' }}
                  labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                  formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Client Acquisition */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Client Acquisition</h2>
              <p className="text-sm text-slate-500">New vs Returning Clients</p>
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option>Monthly</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '14px' }}
                  labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="new" name="New Clients" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returning" name="Returning" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts Area: Bottom 3 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart 3: Server Load */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-display text-lg font-bold text-slate-900">Server Load</h2>
            <p className="text-sm text-slate-500">Average CPU & RAM usage</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serverLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '12px' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Line type="monotone" dataKey="cpu" name="CPU (%)" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="ram" name="RAM (%)" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Support Tickets */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="mb-2">
            <h2 className="font-display text-lg font-bold text-slate-900">Support Tickets</h2>
            <p className="text-sm text-slate-500">Resolution status breakdown</p>
          </div>
          <div className="flex-1 min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={ticketData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {ticketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Network Traffic */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-display text-lg font-bold text-slate-900">Network Traffic</h2>
            <p className="text-sm text-slate-500">Inbound vs Outbound (TB)</p>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bandwidthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '12px' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Area type="monotone" dataKey="in" name="Inbound" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="out" name="Outbound" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Area: Users & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Access Users */}
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                {recentUsers.map((u, i) => (
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
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No recent users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 shrink-0 rounded-full ${activity.dot} ring-4 ring-white`}></div>
                  {i !== recentActivity.length - 1 && <div className="h-full w-px bg-slate-200 mt-2"></div>}
                </div>
                <div className="pb-6 last:pb-0">
                  <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{activity.desc}</p>
                  <p className="mt-1 text-[10px] font-medium text-slate-400">{activity.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


