import React from "react";
import { DownloadSimple, Funnel, MagnifyingGlass, Receipt, FilePdf, PaperPlaneTilt, CheckCircle, Clock } from "@phosphor-icons/react";

export default function AdminBilling() {
  const invoices = [
    { id: "INV-2024-1001", client: "PT. Maju Mundur", amount: "Rp 1.500.000", date: "15 Sep 2024", due: "22 Sep 2024", status: "Paid" },
    { id: "INV-2024-1002", client: "Budi Santoso", amount: "Rp 450.000", date: "16 Sep 2024", due: "23 Sep 2024", status: "Unpaid" },
    { id: "INV-2024-1003", client: "Toko Online Berkah", amount: "Rp 750.000", date: "10 Sep 2024", due: "17 Sep 2024", status: "Overdue" },
    { id: "INV-2024-1004", client: "Siti Aminah", amount: "Rp 150.000", date: "16 Sep 2024", due: "16 Sep 2024", status: "Paid" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Billing & Invoices</h1>
          <p className="text-sm text-slate-500">Manage all transactions and billing cycles</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
          <Receipt className="h-5 w-5" weight="bold" /> Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Unpaid Invoices</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900">Rp 12.450.000</p>
          <p className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded-full">45 pending</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Overdue (Dunning)</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900">Rp 3.200.000</p>
          <p className="mt-2 text-xs font-medium text-red-600 bg-red-50 inline-block px-2 py-0.5 rounded-full">12 overdue</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Revenue (30 Days)</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900">Rp 45.800.000</p>
          <p className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full">+12% vs last month</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 p-4">
          <div className="relative w-full sm:max-w-xs">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoice ID or client..." 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Funnel className="h-4 w-4" /> Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <DownloadSimple className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Dates</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{inv.id}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {inv.client}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {inv.amount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900">{inv.date}</div>
                    <div className="text-[11px] text-slate-500">Due: {inv.due}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      inv.status === 'Unpaid' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {inv.status === 'Paid' && <CheckCircle weight="bold" className="h-3.5 w-3.5" />}
                      {inv.status === 'Unpaid' && <Clock weight="bold" className="h-3.5 w-3.5" />}
                      {inv.status === 'Overdue' && <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors tooltip" title="Send Reminder">
                        <PaperPlaneTilt className="h-5 w-5" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors" title="Download PDF">
                        <FilePdf className="h-5 w-5" />
                      </button>
                    </div>
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
