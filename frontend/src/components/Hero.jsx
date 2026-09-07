import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { ArrowRight, Check, Server } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-ink-950">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 -translate-y-1/2 translate-x-1/4 w-[900px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -translate-y-1/3 w-[700px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.04)_0%,transparent_60%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Infrastruktur Hosting Terdepan Indonesia
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-white mb-6">
              Hosting VPS
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">
                Performa Kilat.
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
              Solusi cloud hosting dengan NVMe SSD, dirancang untuk menunjang bisnis online Anda dengan kecepatan dan keandalan enterprise.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button size="lg" onClick={() => navigate("/register")}>
                Mulai Sekarang
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("harga")?.scrollIntoView({ behavior: "smooth" })}>
                Lihat Paket
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Free SSL Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Uptime 99.9% Terjamin</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Support 24/7</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="rounded-2xl border border-slate-800 bg-ink-900/80 backdrop-blur-sm p-1 shadow-[0_0_80px_rgba(6,182,212,0.08)]">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-xs text-slate-500 font-mono">KiosHosting Dashboard</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "CPU", value: "2 vCore", color: "cyan" },
                      { label: "RAM", value: "8 GB", color: "cyan" },
                      { label: "SSD", value: "100 GB", color: "cyan" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-ink-950 rounded-lg p-4 border border-slate-800/60">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-white font-display">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-ink-950 rounded-lg p-4 border border-slate-800/60">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-500">Network Usage</span>
                      <span className="text-cyan-400 font-mono">42%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-ink-950 rounded-lg p-4 border border-slate-800/60">
                    <p className="text-xs text-slate-500 mb-2">Active Services</p>
                    <div className="flex gap-2">
                      {["web1", "api", "db"].map((svc) => (
                        <span key={svc} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 border border-cyan-500/20 rounded-2xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 border border-cyan-500/15 rounded-xl rotate-12" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
