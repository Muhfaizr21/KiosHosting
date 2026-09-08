import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Check, ArrowRight, Sparkle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/auth";

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchPlans() {
      try {
        const data = await api("GET", "/products/plans");
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      } catch (err) {
        console.warn("Gagal memuat paket dari backend, memakai fallback:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  function parseFeatures(plan) {
    if (Array.isArray(plan.features)) return plan.features;
    if (typeof plan.features === "string" && plan.features.trim()) {
      return plan.features
        .split(/[,\n]/)
        .map((f) => f.trim())
        .filter(Boolean);
    }
    return [
      `${plan.disk || "10 GB NVMe"} Storage`,
      `${plan.cpu || "1 Core"} CPU / ${plan.ram || "1 GB"} RAM`,
      `Bandwidth ${plan.bandwidth || "Unlimited"}`,
      "Free SSL Let's Encrypt",
      "Uptime Guarantee 99.9%",
      "Support WhatsApp & Ticket",
    ];
  }

  // Fallback data if backend is starting up or empty
  const displayPlans =
    plans.length > 0
      ? plans
      : [
          {
            id: 1,
            name: "Starter Pro",
            target: "Blogger & UMKM",
            price: 15000,
            yearly_price: 150000,
            featured: false,
            features: "Full NVMe SSD, Free SSL Let's Encrypt, 1 Core CPU / 1 GB RAM, Support WhatsApp, Uptime 99.9%, Auto Backup Mingguan",
          },
          {
            id: 2,
            name: "Business Pro",
            target: "Toko Online & UKM",
            price: 45000,
            yearly_price: 450000,
            featured: true,
            features: "Semua Fitur Starter Pro, Prioritas Support 24/7, Domain .com/.id Gratis, Backup Otomatis Harian, DDoS Protection, Staging Environment",
          },
          {
            id: 3,
            name: "Enterprise Cloud",
            target: "Agency & Developer",
            price: 120000,
            yearly_price: 1200000,
            featured: false,
            features: "Semua Fitur Business Pro, Dedicated IP, Akses SSH Penuh, Migrasi Website Gratis, Multi-PHP 7.4 - 8.3, Bebas Migrasi",
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
            Pilih sesuai kebutuhan bisnis Anda saat ini. Upgrade ke paket atas kapan saja dengan hitungan prorata.
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {displayPlans.map((plan, idx) => {
            const isFeatured = Boolean(plan.featured || plan.is_featured);
            const monthlyNum = Number(plan.price) || 0;
            const yearlyNum =
              plan.yearly_price && Number(plan.yearly_price) > 0
                ? Number(plan.yearly_price)
                : monthlyNum * 10;

            const priceFormatted = isYearly
              ? yearlyNum.toLocaleString("id-ID")
              : monthlyNum.toLocaleString("id-ID");

            const featureList = parseFeatures(plan);

            return (
              <motion.div
                key={plan.id || plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`relative flex flex-col p-7 rounded-2xl transition-all duration-300 ${
                  isFeatured
                    ? "bg-slate-900 border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.18)]"
                    : "bg-ink-900/60 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {isFeatured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500 text-ink-950 text-xs font-bold uppercase tracking-wider shadow-lg">
                      <Sparkle className="h-3 w-3 fill-ink-950" />
                      Populer
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{plan.target || "Solusi hosting handal"}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm text-slate-400 font-medium">Rp</span>
                    <span className="text-4xl font-extrabold tracking-tight text-white">
                      {priceFormatted}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">per {isYearly ? "tahun" : "bulan"}</p>
                </div>

                <ul className="flex-1 space-y-3.5 mb-8">
                  {featureList.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-cyan-400" />
                      <span className="text-sm text-slate-300 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isFeatured ? "default" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/register?plan=${encodeURIComponent(plan.name)}`)}
                >
                  Pilih {plan.name}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 max-w-2xl mx-auto">
          Semua paket sudah termasuk SSL gratis dan monitoring uptime 24/7. Domain gratis berlaku untuk paket tahunan.
        </p>
      </div>
    </section>
  );
}
