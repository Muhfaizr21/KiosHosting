import React from "react";
import { Lifebuoy, PaperPlaneRight, User, Clock, CheckCircle } from "@phosphor-icons/react";

export default function AdminSupport() {
  const tickets = [
    { id: "#T-8091", subject: "Website cannot be accessed after SSL install", client: "Budi Santoso", dept: "Technical", priority: "High", status: "Open", time: "15 mins ago" },
    { id: "#T-8090", subject: "How to upgrade my plan?", client: "Siti Aminah", dept: "Billing", priority: "Low", status: "Answered", time: "2 hours ago" },
    { id: "#T-8089", subject: "Domain pointing issue to new node", client: "PT. Maju Mundur", dept: "Domain", priority: "Medium", status: "Open", time: "4 hours ago" },
    { id: "#T-8088", subject: "Payment not verified automatically", client: "Toko Online Berkah", dept: "Billing", priority: "High", status: "Closed", time: "1 day ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Support & Helpdesk</h1>
          <p className="text-sm text-slate-500">Manage client tickets and communications</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <p className="text-sm font-medium text-slate-500">Open Tickets</p>
          <p className="mt-1 font-display text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <p className="text-sm font-medium text-slate-500">Awaiting Reply</p>
          <p className="mt-1 font-display text-3xl font-bold text-amber-600">5</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <p className="text-sm font-medium text-slate-500">Avg Response Time</p>
          <p className="mt-1 font-display text-3xl font-bold text-emerald-600">14m</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <p className="text-sm font-medium text-slate-500">Closed (Today)</p>
          <p className="mt-1 font-display text-3xl font-bold text-slate-900">24</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-display text-lg font-bold text-slate-900">Recent Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Subject & ID</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{t.subject}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400">{t.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{t.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                        <User className="h-3 w-3" weight="fill" />
                      </div>
                      <span className="font-medium text-slate-700">{t.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {t.dept}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      t.status === 'Open' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      t.status === 'Answered' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {t.status === 'Open' && <Clock weight="bold" className="h-3 w-3" />}
                      {t.status === 'Answered' && <PaperPlaneRight weight="fill" className="h-3 w-3" />}
                      {t.status === 'Closed' && <CheckCircle weight="fill" className="h-3 w-3" />}
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">View</button>
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
