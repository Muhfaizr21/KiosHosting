import React from "react";
import { Globe, ShieldCheck, HardDrives, CloudArrowUp, CaretRight } from "@phosphor-icons/react";
import Shell from "./Shell.jsx";
import { getServices } from "../../lib/store";

export default function Services() {
  const services = getServices();

  return (
    <Shell title="Detail Layanan" subtitle="Kelola website, DNS, dan domain per paket">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4">
          {services.map((srv) => (
            <div key={srv.id} className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-zinc-900">{srv.nama}</p>
                  <p className="text-sm text-zinc-500">{srv.id} · Paket {srv.paket}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">{srv.status}</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  [Globe, "Domain", srv.nama],
                  [ShieldCheck, "SSL", srv.ssl],
                  [CloudArrowUp, "Backup", srv.backup],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <Icon className="h-5 w-5 text-zinc-500" />
                    <p className="mt-3 text-sm text-zinc-500">{label}</p>
                    <p className="mt-1 font-semibold text-zinc-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700"><HardDrives className="h-4 w-4" /> Buka panel</button>
                <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700">Kelola DNS <CaretRight className="h-4 w-4" /></button>
                <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700">Kelola domain</button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="font-display text-lg font-semibold text-zinc-900">Chart trafik</p>
            <div className="mt-6 flex items-end gap-2 h-44">
              {[42, 58, 49, 67, 55, 71, 63].map((n, i) => (
                <div key={i} className="flex-1 rounded-t-2xl bg-gradient-to-t from-zinc-900 to-violet-500" style={{ height: `${n}%` }} />
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-500">SOP startup: pantau trafik harian, cek lonjakan, lalu optimasi cache saat promo berjalan.</p>
          </div>
          <div className="rounded-[28px] border border-zinc-200 bg-zinc-900 p-6 text-white">
            <p className="font-display text-lg font-semibold">SOP layanan</p>
            <ul className="mt-3 space-y-3 text-sm text-zinc-300">
              <li>1. Domain aktif dan pointing benar.</li>
              <li>2. SSL terpasang dan backup jalan.</li>
              <li>3. Panel pelanggan siap dipakai.</li>
              <li>4. Support dihubungi jika ada error.</li>
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  );
}
