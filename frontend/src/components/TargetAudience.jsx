import React from "react";
import { PenTool, Store, Code, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function TargetAudience() {
  const personas = [
    {
      title: "Blogger, Portfolio & Content Creator",
      icon: <PenTool className="h-5 w-5 text-cyan-400" />,
      desc: "Website ringan, kecepatan akses stabil untuk pengunjung organik. SSL gratis, panel mudah dioperasikan tanpa harus paham server.",
      benefits: ["Satu website", "Setup 10 menit", "SSL & Backup gratis"],
    },
    {
      title: "Toko Online & UMKM",
      icon: <Store className="h-5 w-5 text-emerald-400" />,
      desc: "Performance kritis untuk checkout lancar. Data pelanggan aman, server stabil di jam-jam ramai penjualan, dan siap untuk integrasi payment gateway.",
      benefits: ["Multi-domain", "Payment gateway ready", "Stabil di jam ramai"],
    },
    {
      title: "Developer & Web Agency",
      icon: <Code className="h-5 w-5 text-violet-400" />,
      desc: "Deploy mudah ke staging maupun produksi, akses SSH penuh, environment terisolasi per proyek klien. Tidak perlu pusing soal infra.",
      benefits: ["Akses SSH", "Multi-site", "Migrasi gratis"],
    },
  ];

  return (
    <section id="audiens" className="py-24 bg-ink-900/50 border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            KiosHosting dirancang untuk kebutuhan nyata
          </h2>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            Beda kebutuhan, beda paket. Tapi yang sama: server stabil, harga transparan, dan bantuan teknis yang benar-benar merespon.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {personas.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="group flex flex-col p-7 rounded-2xl border border-slate-800 bg-ink-950/70 hover:border-slate-700 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg bg-slate-800/80 flex items-center justify-center mb-5">
                {p.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-3">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">{p.desc}</p>
              <ul className="space-y-2 pt-4 border-t border-slate-800/60">
                {p.benefits.map((b, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
