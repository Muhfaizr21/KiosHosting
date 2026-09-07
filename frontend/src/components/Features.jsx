import React from "react";
import { HardDrive, ShieldCheck, Clock, LifeBuoy, Zap, Database, Cpu, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function Features() {
  const features = [
    {
      title: "NVMe SSD 100GB",
      description: "Kecepatan baca/tulis hingga 10x lebih cepat dari SSD konvensional.",
      icon: <HardDrive className="h-6 w-6 text-cyan-400" />,
      accent: "cyan",
    },
    {
      title: "Free SSL Otomatis",
      description: "Enkripsi standar industri dengan Let's Encrypt, aktif tanpa konfigurasi manual.",
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      accent: "emerald",
    },
    {
      title: "Uptime 99.9%",
      description: "Monitoring proaktif 24/7 menjamin server Anda selalu online dan terdeteksi lebih awal.",
      icon: <Clock className="h-6 w-6 text-amber-400" />,
      accent: "amber",
    },
    {
      title: "Support 24/7",
      description: "Tim teknis siap membantu via WhatsApp dan tiket bantuan, respons di bawah 15 menit.",
      icon: <LifeBuoy className="h-6 w-6 text-rose-400" />,
      accent: "rose",
    },
    {
      title: "2 vCPU / 8GB RAM",
      description: "Infrastruktur dedicated yang menjamin kelancaran trafik tinggi dan aplikasi berat.",
      icon: <Cpu className="h-6 w-6 text-violet-400" />,
      accent: "violet",
    },
    {
      title: "Backup Otomatis",
      description: "Pencadangan mingguan ke cloud storage, restore instan jika terjadi kehilangan data.",
      icon: <Database className="h-6 w-6 text-sky-400" />,
      accent: "sky",
    },
  ];

  return (
    <section id="fitur" className="py-24 bg-ink-950 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Infrastruktur Kelas Enterprise
          </h2>
          <p className="mt-3 text-lg text-slate-400 leading-relaxed">
            Semua yang Anda butuhkan untuk membangun dan mengembangkan bisnis online, tanpa biaya tersembunyi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative p-6 rounded-xl border border-slate-800 bg-ink-900/50 hover:border-slate-700 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-slate-800/80 mb-5 group-hover:bg-slate-800 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 font-display">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs text-cyan-400 font-medium inline-flex items-center gap-1">
                  Detail <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
