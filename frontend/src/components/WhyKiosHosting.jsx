import React from "react";
import { Server, HardDrive, Globe2, Headphones } from "lucide-react";
import { motion } from "framer-motion";

export function WhyKiosHosting() {
  const reasons = [
    {
      icon: <HardDrive className="h-5 w-5 text-cyan-400" />,
      title: "NVMe Bukan SATA",
      desc: "Penyimpanan NVMe memiliki kecepatan baca tulis 5-10x lebih cepat dari SATA SSD. Website memang lebih cepat, bukan cuma klaim di brosur.",
    },
    {
      icon: <Globe2 className="h-5 w-5 text-emerald-400" />,
      title: "Lokal Server, Latensi Rendah",
      desc: "Semua server berada di Jakarta, langsung terkoneksi ke jaringan IIX dan OpenIXP. Pengunjung lokal mendapatkan akses jauh lebih cepat.",
    },
    {
      icon: <Server className="h-5 w-5 text-violet-400" />,
      title: "Datacenter Tier-3",
      desc: "Redundansi power, jaringan, dan pendingin berstandar Tier-3. Server tidak mati hanya karena satu titik kegagalan.",
    },
    {
      icon: <Headphones className="h-5 w-5 text-amber-400" />,
      title: "Bantuan Migrasi Gratis",
      desc: "Tim kami akan memindahkan website Anda dari host lama. Tanpa downtime, tanpa ribet, tanpa biaya.",
    },
  ];

  return (
    <section className="py-24 bg-ink-950 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Kenapa lebih dari sekadar hosting murah?
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed max-w-lg">
              Banyak hosting menawarkan harga miring. Pertanyaannya, apa yang Anda dapatkan di balik harga tersebut?
            </p>
            <p className="mt-3 text-slate-400 leading-relaxed">
              KiosHosting tidak percaya pada potongan harga yang mengorbankan kualitas. Kami membangun infrastruktur yang bisa diandalkan untuk bisnis, bukan sekadar murah di awal tapi mahal di masalah.
            </p>
          </motion.div>

          {/* Right features */}
          <div className="space-y-4">
            {reasons.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="flex gap-4 p-5 rounded-2xl border border-slate-800 bg-ink-900/50 hover:border-slate-700 transition-all"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-800/80 flex items-center justify-center">
                  {r.icon}
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white mb-1">{r.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
