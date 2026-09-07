import React from "react";
import { Server, ShieldCheck, Activity, Headphones, LayoutGrid, Globe2, HardDrive, Code, Database, Settings2, Network } from "lucide-react";
import { motion } from "framer-motion";

export function Features() {
  const features = [
    {
      title: "Full NVMe Storage",
      description: "Tidak ada SATA, tidak ada hard drive lambat. Semua storage server menggunakan NVMe untuk latensi dan throughput yang jauh lebih tinggi.",
      icon: <HardDrive className="h-6 w-6 text-cyan-400" />,
    },
    {
      title: "Let's Encrypt SSL",
      description: "Sertifikat SSL otomatis untuk setiap domain yang aktif di panel. Tidak perlu konfigurasi manual atau perpanjangan berkala.",
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
    },
    {
      title: "Monitoring Uptime",
      description: "Server kami dimonitor 24 jam melalui sistem proaktif. Jika ada gangguan, tim teknis langsung menindaklanjuti sebelum Anda melapor.",
      icon: <Activity className="h-6 w-6 text-amber-400" />,
    },
    {
      title: "DDoS Protection",
      description: "Perlindungan serangan DDoS di tingkat network (L3/L4) dan aplikasi (L7) sudah termasuk tanpa perlu add-on berbayar.",
      icon: <Network className="h-6 w-6 text-rose-400" />,
    },
    {
      title: "CyberPanel & cPanel",
      description: "Akses panel manajemen hosting sesuai kebutuhan: CyberPanel untuk performa LiteSpeed, atau cPanel untuk kebiasaan konvensional.",
      icon: <LayoutGrid className="h-6 w-6 text-violet-400" />,
    },
    {
      title: "PHP Multi-Version",
      description: "PHP 7.4 hingga 8.3 bisa dipilih langsung dari panel. Cocok untuk proyek lama yang belum kompatibel atau framework terbaru.",
      icon: <Code className="h-6 w-6 text-sky-400" />,
    },
    {
      title: "Migrasi Gratis",
      description: "Tim kami membantu memindahkan website dari host lama tanpa downtime, tanpa biaya tambahan, tanpa ribet.",
      icon: <Globe2 className="h-6 w-6 text-indigo-400" />,
    },
    {
      title: "Backup Mingguan",
      description: "Data terbackup otomatis ke cloud storage setiap minggu. Restore instan dari panel jika terjadi kehilangan atau kerusakan data.",
      icon: <Database className="h-6 w-6 text-cyan-400" />,
    },
    {
      title: "Support Responsif",
      description: "Tim teknis aktif via WhatsApp dan sistem tiket. Respon untuk pelanggan prioritas dijamin di bawah 15 menit pada jam kerja.",
      icon: <Headphones className="h-6 w-6 text-emerald-400" />,
    },
    {
      title: "Node Lokal Jakarta",
      description: "Semua infrastruktur berada di datacenter Jakarta, langsung terkoneksi IIX dan OpenIXP. Latensi rendah untuk pengunjung Indonesia.",
      icon: <Server className="h-6 w-6 text-amber-400" />,
    },
    {
      title: "Staging Environment",
      description: "Uji perubahan website sebelum dipublikasikan langsung ke produksi tanpa mengganggu pengunjung yang sedang aktif.",
      icon: <Settings2 className="h-6 w-6 text-rose-400" />,
    },
  ];

  return (
    <section id="fitur" className="py-24 bg-ink-950 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Infrastruktur dan fitur teknis yang siap pakai
          </h2>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            Fokus Anda adalah membangun konten dan mengelola bisnis. Soal server, performa, keamanan, dan akses teknis, biar kami yang menanganinya.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="group relative p-6 rounded-2xl bg-ink-900/50 border border-slate-800 hover:border-slate-700 hover:bg-ink-900 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-slate-800/80 mb-5">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2 font-display">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
