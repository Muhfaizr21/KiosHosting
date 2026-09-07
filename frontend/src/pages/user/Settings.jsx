import React from "react";
import { User, LockKey, FloppyDisk } from "@phosphor-icons/react";
import { getSession } from "../../lib/auth";

export default function Settings() {
  const session = getSession() || { name: "User", email: "user@example.com" };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Pengaturan Akun</h2>
        <p className="mt-1 text-sm text-slate-500">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-8">
          {/* Form Profil */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <User className="h-5 w-5" weight="duotone" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">Informasi Pribadi</h3>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Nama Lengkap</label>
                <input type="text" defaultValue={session.name} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Email Utama</label>
                <input type="email" defaultValue={session.email} disabled className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none" />
                <p className="text-[11px] text-slate-500">Hubungi support untuk mengubah email.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Nomor HP / WhatsApp</label>
                <input type="tel" defaultValue="+6281234567890" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Nama Perusahaan (Opsional)</label>
                <input type="text" defaultValue="PT KiosHosting Indonesia" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10" />
              </div>
            </div>
            
            <div className="mt-8">
              <button className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow-violet-600/20">
                <FloppyDisk className="mr-2 h-4 w-4" /> Simpan Profil
              </button>
            </div>
          </div>

          {/* Form Password */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <LockKey className="h-5 w-5" weight="duotone" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">Ubah Password</h3>
            </div>
            
            <div className="flex flex-col gap-5 max-w-lg">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Password Saat Ini</label>
                <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Password Baru</label>
                <input type="password" placeholder="Minimal 8 karakter" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Konfirmasi Password Baru</label>
                <input type="password" placeholder="Ulangi password baru" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10" />
              </div>
              
              <div className="mt-2">
                <button className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Kanan - Keamanan */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
            <h3 className="font-display text-base font-bold text-slate-900">Autentikasi Dua Faktor (2FA)</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Lindungi akun KiosHosting Anda dari akses tidak sah dengan mewajibkan kode verifikasi tambahan saat login.
            </p>
            <button className="mt-5 w-full inline-flex h-10 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-sm font-bold text-violet-700 transition-colors hover:bg-violet-100">
              Aktifkan 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
