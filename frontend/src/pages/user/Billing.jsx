import React, { useState, useEffect } from "react";
import { Receipt, CheckCircle, ClockCountdown, FilePdf, CreditCard, WarningCircle } from "@phosphor-icons/react";
import { meApi } from "../../lib/auth";

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      const res = await meApi.invoices({ limit: 50 });
      setInvoices(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const unpaidInvoices = invoices.filter(i => i.status === "Unpaid" || i.status === "Overdue" || i.status === "unpaid");
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle weight="fill" /> Lunas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <ClockCountdown weight="fill" /> {status}
      </span>
    );
  };

  const formatCurrency = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Tagihan & Pembayaran</h2>
          <p className="mt-1 text-sm text-slate-500">Kelola riwayat tagihan dan metode pembayaran Anda.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <WarningCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Tagihan Belum Dibayar</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">
            {loading ? "..." : formatCurrency(totalUnpaid)}
          </p>
          {unpaidInvoices.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">{unpaidInvoices.length} invoice menunggu pembayaran</p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Dibayar</p>
          <p className="mt-2 font-display text-3xl font-bold text-emerald-600">
            {loading ? "..." : formatCurrency(
              invoices.filter(i => i.status === "Paid" || i.status === "paid").reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm md:col-span-1 flex flex-col justify-center border-dashed">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <CreditCard weight="duotone" className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Metode Pembayaran</p>
              <p className="text-sm text-slate-500">Belum ada metode tersimpan.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="font-semibold text-slate-900">Riwayat Tagihan</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400">Memuat data tagihan...</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">Belum ada tagihan.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-500">
                <tr>
                  <th className="border-b border-slate-100 px-6 py-4 font-medium">Invoice</th>
                  <th className="border-b border-slate-100 px-6 py-4 font-medium">Tanggal</th>
                  <th className="border-b border-slate-100 px-6 py-4 font-medium">Jumlah</th>
                  <th className="border-b border-slate-100 px-6 py-4 font-medium">Jatuh Tempo</th>
                  <th className="border-b border-slate-100 px-6 py-4 font-medium">Status</th>
                  <th className="border-b border-slate-100 px-6 py-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">#{inv.id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(inv.amount)}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.due}</td>
                    <td className="px-6 py-4">{statusBadge(inv.status)}</td>
                    <td className="px-6 py-4">
                      {(inv.status === "Unpaid" || inv.status === "Overdue" || inv.status === "unpaid") && (
                        <button
                          disabled={payingId === inv.id}
                          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
                        >
                          {payingId === inv.id ? "Memproses..." : "Bayar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
