import React from "react";
import { Receipt, CheckCircle, ClockCountdown, FilePdf, CreditCard } from "@phosphor-icons/react";

export default function Billing() {
  const invoices = [
    { id: "INV-2023-001", date: "01 Sep 2026", description: "Perpanjangan Paket Bisnis Pro (Tahunan)", amount: "Rp 1.500.000", status: "unpaid", due: "14 Sep 2026" },
    { id: "INV-2023-002", date: "01 Ags 2026", description: "Registrasi Domain example.com (Tahunan)", amount: "Rp 150.000", status: "paid", due: "14 Ags 2026" },
    { id: "INV-2023-003", date: "01 Jul 2026", description: "Upgrade SSL Wildcard", amount: "Rp 350.000", status: "paid", due: "14 Jul 2026" },
  ];

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Tagihan & Pembayaran</h2>
          <p className="mt-1 text-sm text-slate-500">Kelola riwayat tagihan dan metode pembayaran Anda.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Tagihan Belum Dibayar</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">Rp 1.500.000</p>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition-colors">
            <CreditCard weight="fill" className="h-4 w-4" /> Bayar Semua
          </button>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm md:col-span-2 flex flex-col justify-center border-dashed">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <CreditCard weight="duotone" className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Metode Pembayaran Tersimpan</p>
              <p className="text-sm text-slate-500">Belum ada metode pembayaran yang disimpan untuk auto-renewal.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="font-semibold text-slate-900">Riwayat Tagihan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500">
              <tr>
                <th className="border-b border-slate-100 px-6 py-4 font-medium">Invoice</th>
                <th className="border-b border-slate-100 px-6 py-4 font-medium">Deskripsi</th>
                <th className="border-b border-slate-100 px-6 py-4 font-medium">Jumlah</th>
                <th className="border-b border-slate-100 px-6 py-4 font-medium">Status</th>
                <th className="border-b border-slate-100 px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{inv.id}</div>
                    <div className="text-xs text-slate-500">{inv.date}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{inv.description}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{inv.amount}</td>
                  <td className="px-6 py-4">
                    {inv.status === "paid" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle weight="fill" /> Lunas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <ClockCountdown weight="fill" /> Menunggu (Jatuh tempo: {inv.due})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {inv.status === "unpaid" && (
                        <button className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700 transition-colors">
                          Bayar
                        </button>
                      )}
                      <button className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <FilePdf className="h-4 w-4" />
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
