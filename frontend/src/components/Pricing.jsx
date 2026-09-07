import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: "Paket Hemat",
      target: "Blogger & UMKM",
      monthly: "50.000",
      yearly: "500.000",
      features: ["Full NVMe SSD", "Free SSL Let's Encrypt", "Support WhatsApp", "Uptime 99.9%", "Auto Backup Mingguan"],
      featured: false,
    },
    {
      name: "Paket Bisnis",
      target: "Toko Online & UKM",
      monthly: "100.000",
      yearly: "1.000.000",
      features: ["Semua Paket Hemat", "Prioritas Support", "Domain .com/.id Gratis", "Backup Otomatis", "DDoS Protection", "Staging Environment"],
      featured: true,
    },
    {
      name: "Paket Profesional",
      target: "Agency & Developer",
      monthly: "200.000",
      yearly: "2.000.000",
      features: ["Semua Paket Bisnis", "Dedicated IP", "Akses SSH Penuh", "Migrasi Website Gratis", "Multi-PHP 7.4 - 8.3", "Bebas Migrasi"],
      featured: false,
    },
  ];

  return (
    <section id="harga" className="py-24 bg-ink-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Harga transparan, tanpa biaya tersembunyi
          </h2>
          <p className="mt-3 text-lg text-slate-400">
            Pilih sesuai kebutuhan bisnis Anda saat ini. Upgrade ke paket atas kapan saja.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-ink-900 border border-slate-800 rounded-full mb-10">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              !isYearly ? "bg-cyan-500 text-ink-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Bulanan
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${
              isYearly ? "bg-cyan-500 text-ink-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Tahunan
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20">hemat 2 bln</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`relative flex flex-col p-7 rounded-2xl ${
                plan.featured
                  ? "bg-slate-900 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.12)]"
                  : "bg-ink-900/60 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="px-3 py-1 rounded-full bg-cyan-500 text-ink-950 text-xs font-bold uppercase tracking-wider">
                    Populer
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-display text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{plan.target}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-slate-500 font-medium">Rp</span>
                  <span className="text-4xl font-extrabold tracking-tight text-white">
                    {isYearly ? plan.yearly : plan.monthly}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">per {isYearly ? "tahun" : "bulan"}</p>
              </div>

              <ul className="flex-1 space-y-3.5 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-cyan-400" />
                    <span className="text-sm text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.featured ? "default" : "outline"}
                size="lg"
                className="w-full"
                onClick={() => navigate("/register")}
              >
                Pilih {plan.name}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 max-w-2xl mx-auto">
          Semua paket sudah termasuk SSL gratis dan monitoring uptime 24/7. Domain gratis berlaku untuk paket tahunan.
        </p>
      </div>
    </section>
  );
}
