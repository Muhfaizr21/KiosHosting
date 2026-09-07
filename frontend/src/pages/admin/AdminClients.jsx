import React from "react";
import { Users, MagnifyingGlass, Funnel, DotsThree, Trash, LockKey, CheckCircle } from "@phosphor-icons/react";

export default function AdminClients() {
  // Mock Data
  const clients = [
    { id: "CL-001", name: "Budi Santoso", email: "budi@example.com", status: "Active", services: 3, joined: "12 Aug 2024" },
    { id: "CL-002", name: "PT. Maju Mundur", email: "admin@majumundur.co.id", status: "Active", services: 12, joined: "01 Sep 2024" },
    { id: "CL-003", name: "Siti Aminah", email: "siti.aminah@gmail.com", status: "Suspended", services: 1, joined: "15 Jul 2024" },
    { id: "CL-004", name: "Toko Online Berkah", email: "hello@tokoberkah.com", status: "Active", services: 2, joined: "02 Sep 2024" },
    { id: "CL-005", name: "Joko Susilo", email: "joko.susilo@yahoo.com", status: "Terminated", services: 0, joined: "10 Jan 2024" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Clients Management</h1>
          <p className="text-sm text-slate-500">Manage all registered users and their accounts</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
          <Users className="h-5 w-5" weight="bold" /> Add New Client
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 p-4">
          <div className="relative w-full sm:max-w-xs">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients by name, email, or ID..." 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Funnel className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Client Details</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Active Services</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{client.name}</div>
                    <div className="text-xs text-slate-500">{client.email}</div>
                    <div className="mt-1 text-[10px] font-mono text-slate-400">{client.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      client.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                      client.status === 'Suspended' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        client.status === 'Active' ? 'bg-emerald-500' :
                        client.status === 'Suspended' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}></span>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {client.services} {client.services === 1 ? 'Service' : 'Services'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {client.joined}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors tooltip" title="Manage Client">
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors" title="Force Suspend">
                        <LockKey className="h-5 w-5" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Terminate">
                        <Trash className="h-5 w-5" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors">
                        <DotsThree className="h-5 w-5" weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-900">1</span> to <span className="font-semibold text-slate-900">5</span> of <span className="font-semibold text-slate-900">5</span> results</p>
          <div className="flex items-center gap-1">
            <button className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium text-slate-400 cursor-not-allowed">Prev</button>
            <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-slate-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
