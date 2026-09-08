import React, { useState, useEffect } from "react";
import { Lifebuoy, Plus, CheckCircle, Clock, ChatCircleText, X, ArrowRight } from "@phosphor-icons/react";
import { meApi } from "../../lib/auth";

export default function Support() {
  const [showForm, setShowForm] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      setLoading(true);
      const res = await meApi.tickets();
      setTickets(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "open") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/50">
          Menunggu Balasan
        </span>
      );
    }
    if (s === "answered" || s === "in_progress") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/50">
          Dijawab (Tunggu Aksi Anda)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
        <CheckCircle weight="fill" /> Ditutup
      </span>
    );
  };

  async function handleCreateTicket(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const subject = formData.get("subject");
    const department = formData.get("department");
    const message = formData.get("message");

    if (!subject || !message) return;

    try {
      setSubmitting(true);
      const res = await meApi.createTicket({
        subject,
        department,
        priority: "Medium",
        message,
      });
      setTickets([res.data, ...tickets]);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(ticketId) {
    const text = replyTexts[ticketId];
    if (!text) return;
    try {
      await meApi.replyTicket(ticketId, { message: text });
      setReplyTexts({});
      loadTickets();
    } catch (err) {
      setError(err.message);
    }
  }

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

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateTicket} className="mb-8 rounded-2xl border border-violet-100 bg-violet-50/50 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Buka Tiket Bantuan Baru</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Departemen</label>
              <select name="department" required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                <option value="">Pilih departemen</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Billing">Billing & Pembayaran</option>
                <option value="General">Pre-Sales / Umum</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Layanan Terkait</label>
              <select name="service" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                <option value="">Pilih layanan</option>
                <option value="shared">Shared Hosting</option>
                <option value="vps">VPS / Dedicated</option>
                <option value="domain">Domain & DNS</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Subjek</label>
            <input name="subject" required type="text" placeholder="Ringkasan singkat kendala Anda" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Pesan Detail</label>
            <textarea name="message" required rows={4} placeholder="Jelaskan secara detail kendala yang dialami..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"></textarea>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={submitting} className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition-colors disabled:opacity-50">
              {submitting ? "Mengirim..." : "Kirim Tiket"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-2">
          <Lifebuoy className="h-5 w-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Daftar Tiket Anda</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400">Memuat tiket...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">
              <p>Belum ada tiket.</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm font-bold text-violet-600 hover:text-violet-700 underline">
                Buat tiket pertama &rarr;
              </button>
            </div>
          ) : (
            tickets.map((tkt) => (
              <div key={tkt.id} className="flex flex-col gap-4 p-6 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">{tkt.subject}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{tkt.code || tkt.id}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><ChatCircleText className="h-4 w-4" /> {tkt.department}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {tkt.created_at}</span>
                    <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> {tkt.reply_count} balasan</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>{statusBadge(tkt.status)}</div>
                  {tkt.status !== "closed" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ketik balasan..."
                        value={replyTexts[tkt.id] || ""}
                        onChange={(e) => setReplyTexts({ ...replyTexts, [tkt.id]: e.target.value })}
                        className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-violet-500"
                      />
                      <button
                        onClick={() => handleReply(tkt.id)}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
                      >
                        Kirim
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
