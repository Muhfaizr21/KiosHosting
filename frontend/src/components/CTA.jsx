import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { ArrowRight, ShieldCheck,Headphones } from "lucide-react";

export function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-ink-900 border-y border-slate-800/60" />
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[800px] h-[400px] bg-cyan-500/10 blur-[80px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          Saatnya toko online dan website Anda berhenti lemot.
        </h2>
        <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Pilih Paket Bisnis untuk pemasangan cepat hari ini. Bantuan migrasi dan SSL gratis sudah termasuk.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/register")} className="gap-2">
            Daftar Sekarang
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById("harga")?.scrollIntoView({ behavior: "smooth" })}>
            Cek Daftar Harga
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Garansi uang kembali 30 hari
          </span>
          <span className="flex items-center gap-1.5">
            <Headphones className="h-4 w-4 text-cyan-400" />
            Support 24/7
          </span>
        </div>
      </div>
    </section>
  );
}
