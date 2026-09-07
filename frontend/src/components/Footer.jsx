import React from "react";
import { Server, Mail, Phone, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ink-950 text-slate-300 border-t border-slate-800/60 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-cyan-500 p-1.5 rounded-md">
                <Server className="h-4 w-4 text-ink-950" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">KiosHosting</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Hosting NVMe untuk bisnis yang butuh situs cepat, stabil, dan siap naik skala.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="text-white font-semibold mb-4">Hubungi</h4>
              <div className="space-y-2">
                <a href="tel:+6281234567890" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>+62 812-3456-7890</span>
                </a>
                <a href="mailto:support@kioshosting.id" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>support@kioshosting.id</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Navigasi</h4>
              <div className="space-y-2">
                <a href="#fitur" className="block text-slate-400 hover:text-white transition-colors">Fitur</a>
                <a href="#audiens" className="block text-slate-400 hover:text-white transition-colors">Target Pasar</a>
                <a href="#harga" className="block text-slate-400 hover:text-white transition-colors">Harga</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KiosHosting. All rights reserved.</p>
          <a href="#" className="inline-flex items-center gap-1 hover:text-slate-300 transition-colors">
            Lihat detail layanan <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
