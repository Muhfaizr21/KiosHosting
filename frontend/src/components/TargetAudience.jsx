import React from "react";
import { PenTool, Store, Code, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export function TargetAudience() {
  const personas = [
    {
      title: "Blogger & Portofolio",
      desc: "Setup cepat, harga ramah pemula, cukup untuk blog pribadi atau showcase kerja.",
      icon: <PenTool className="h-5 w-5 text-cyan-400" />,
      spec: "1 vCPU · 1GB RAM",
    },
    {
      title: "UMKM & Toko Online",
      desc: "Stabilitas tinggi untuk transaksi harian, checkout cepat, data pelanggan aman.",
      icon: <Store className="h-5 w-5 text-emerald-400" />,
      spec: "2 vCPU · 4GB RAM",
    },
    {
      title: "Developer & Agency",
      desc: "Deploy multi-klien, akses SSH penuh, staging environment per proyek.",
      icon: <Code className="h-5 w-5 text-violet-400" />,
      spec: "4 vCPU · 8GB RAM",
    },
  ];

  return (
    <section id="audiens" className="py-24 bg-ink-900/50 border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Didesain untuk setiap tahap bisnis
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed">
              Mulai dari paket terkecil, upgrade kapan saja saat trafik naik. Tanpa migrasi rumit.
            </p>
            <a href="#harga" className="mt-6 inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
              Lihat rekomendasi paket <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {personas.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex gap-5 p-6 rounded-xl border border-slate-800 bg-ink-950/60 hover:border-slate-700 hover:bg-ink-950 transition-all duration-300"
              >
                <div className="shrink-0 w-11 h-11 rounded-lg bg-slate-800/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-lg font-semibold text-white">{p.title}</h3>
                    <span className="text-xs font-mono text-slate-500 whitespace-nowrap hidden sm:block">{p.spec}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
