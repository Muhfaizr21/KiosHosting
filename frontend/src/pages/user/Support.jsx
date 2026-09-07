import React, { useState } from "react";
import { Lifebuoy, Plus, CheckCircle, Clock, ChatCircleText, X } from "@phosphor-icons/react";

export default function Support() {
  const [showForm, setShowForm] = useState(false);

  const tickets = [
    { id: "#TKT-9921", subject: "Bantuan Migrasi WordPress", department: "Technical Support", status: "open", updated: "2 jam yang lalu" },
    { id: "#TKT-9904", subject: "Pertanyaan Upgrade Paket Bisnis Pro", department: "Billing", status: "answered", updated: "1 hari yang lalu" },
    { id: "#TKT-9850", subject: "SSL Error saat diakses dari Chrome", department: "Technical Support", status: "closed", updated: "1 minggu yang lalu" },
  ];

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Pusat Bantuan</h2>
          <p className="mt-1 text-sm text-slate-500">Kelola tiket bantuan dan hubungi tim support kami 24/7.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition-colors"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Batal" : "Buat Tiket Baru"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-violet-100 bg-violet-50/50 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Buka Tiket Bantuan Baru</h3>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowForm(false); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Departemen</label>
                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                  <option>Technical Support</option>
                  <option>Billing & Pembayaran</option>
                  <option>Pre-Sales / Umum</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Layanan Terkait</label>
                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                  <option>Bisnis Pro (example.com)</option>
                  <option>Lainnya</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Subjek</label>
              <input type="text" placeholder="Ringkasan singkat kendala Anda" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Pesan Detail</label>
              <textarea rows={4} placeholder="Jelaskan secara detail kendala yang dialami..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition-colors">
                Kirim Tiket
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-2">
          <Lifebuoy className="h-5 w-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Daftar Tiket Anda</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {tickets.map((tkt) => (
            <div key={tkt.id} className="flex flex-col gap-4 p-6 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between cursor-pointer">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">{tkt.subject}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{tkt.id}</span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><ChatCircleText className="h-4 w-4" /> {tkt.department}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Update {tkt.updated}</span>
                </div>
              </div>
              <div>
                {tkt.status === "open" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/50">
                    Menunggu Balasan
                  </span>
                )}
                {tkt.status === "answered" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/50">
                    Dijawab (Tunggu Aksi Anda)
                  </span>
                )}
                {tkt.status === "closed" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                    <CheckCircle weight="fill" /> Ditutup
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
