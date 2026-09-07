import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "Bagaimana proses migrasi website dari hosting lama?",
    a: "Cukup berikan akses hosting lama atau file backup (File + Database). Tim teknis kami akan membantu memindahkan semua data ke server KiosHosting tanpa downtime signifikan, tanpa biaya tambahan.",
  },
  {
    q: "Apakah domain gratis benar-benar gratis?",
    a: "Ya, gratis untuk tahun pertama jika Anda memilih paket tahunan. Perpanjangan tahun berikutnya mengikuti harga normal domain sesuai TLD (misalnya .com, .id).",
  },
  {
    q: "Berapa lama aktivasi setelah pembayaran?",
    a: "Aktivasi hosting biasanya selesai dalam maksimal 30 menit setelah pembayaran terkonfirmasi. Untuk paket profesional dengan alokasi dedicated IP, bisa hingga 1–2 jam.",
  },
  {
    q: "Apakah bisa untuk WordPress dan Laravel?",
    a: "Bisa, keduanya sangat didukung. Tersedia 1-Click WordPress Installer dan environment PHP 7.4–8.3 termasuk ekstensi yang dibutuhkan (MySQL/MariaDB, Redis optional, Node.js untuk build).",
  },
  {
    q: "Bisakah upgrade paket ke atas kapan saja?",
    a: "Ya. Upgrade bisa dilakukan satu klik via panel tanpa pindah server. File dan database tetap utuh, harga prorata sesuai sisa periode aktif.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-800/70 last:border-0">
      <button
        className="w-full py-5 flex justify-between items-center gap-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm sm:text-base font-medium text-white">{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 ${open ? "rotate-180 text-cyan-400" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-slate-400 leading-relaxed max-w-2xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-ink-950 border-t border-slate-800/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Pertanyaan Umum
          </h2>
          <p className="mt-3 text-lg text-slate-400">Yang paling sering ditanyakan calon pelanggan sebelum mendaftar.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-ink-900/50 px-6 py-2">
          {faqs.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
