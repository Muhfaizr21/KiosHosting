import React, { useState, useEffect } from "react";
import { User, LockKey, FloppyDisk, WarningCircle, ShieldCheck } from "@phosphor-icons/react";
import { meApi } from "../../lib/auth";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await meApi.settings();
      setProfile(res.user);
      setName(res.user?.name || "");
      setEmail(res.user?.email || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      const res = await meApi.updateSettings({ name, email });
      setMessage(res.message);
      setName(res.user?.name || name);
      setEmail(res.user?.email || email);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      const res = await meApi.updateSettings({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMessage(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Pengaturan Akun</h2>
        <p className="mt-1 text-sm text-slate-500">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <WarningCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Memuat pengaturan...</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="flex flex-col gap-8">
            {/* Form Profil */}
            <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <User className="h-5 w-5" weight="duotone" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">Informasi Pribadi</h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Email Utama</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-violet-700 disabled:opacity-50">
                  <FloppyDisk className="mr-2 h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </form>

            {/* Form Password */}
            <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <LockKey className="h-5 w-5" weight="duotone" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">Ubah Password</h3>
              </div>

              <div className="flex flex-col gap-5 max-w-lg">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Password Saat Ini</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10"
                  />
                </div>

                <div className="mt-2">
                  <button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50">
                    {saving ? "Memproses..." : "Update Password"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar Kanan - Keamanan */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" weight="duotone" />
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">Autentikasi Dua Faktor</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Lindungi akun KiosHosting Anda dari akses tidak sah dengan mewajibkan kode verifikasi tambahan saat login.
              </p>
              <button className="mt-5 w-full inline-flex h-10 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-sm font-bold text-violet-700 transition-colors hover:bg-violet-100">
                Aktifkan 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}