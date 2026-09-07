import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeSimple, LockKey, User, Eye, EyeSlash, ArrowRight, HardDrives, ShieldCheck, Lightning, Headset, ArrowLeft } from "@phosphor-icons/react";
import { register } from "../../lib/auth";
import { Logo } from "../../components/ui/Logo";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 3) return setError("Nama minimal 3 karakter.");
    if (!email.includes("@")) return setError("Email tidak valid.");
    if (password.length < 6) return setError("Kata sandi minimal 6 karakter.");
    if (password !== confirm) return setError("Konfirmasi kata sandi tidak cocok.");
    try {
      setLoading(true);
      await register({ name, email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Pane - Branding (Hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-block transition-opacity hover:opacity-90">
            <Logo theme="dark" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight text-white mb-6">
            Mulai Perjalanan Digital Anda.
          </h1>
          <p className="text-lg text-slate-300">
            Bergabunglah dengan ribuan bisnis yang mempercayakan infrastruktur mereka pada KiosHosting.
          </p>
          
          <div className="mt-10 grid gap-4">
            {[
              { icon: ShieldCheck, title: "Keamanan Enterprise", desc: "Perlindungan Anti-DDoS & WAF gratis." },
              { icon: Lightning, title: "Performa Tinggi", desc: "Server NVMe dengan jaminan Uptime 99.9%." },
              { icon: Headset, title: "Dukungan 24/7", desc: "Tim teknis kami selalu siap membantu Anda." }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <Icon weight="duotone" className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{feature.title}</h4>
                    <p className="mt-1 text-sm text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} KiosHosting.id. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-20 xl:px-32 py-10 lg:py-0">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Kembali ke website
          </Link>

          {/* Mobile Logo (Visible only on small screens) */}
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <Logo theme="light" />
            </Link>
          </div>

          <h2 className="font-display text-3xl font-bold text-slate-900">Buat akun baru</h2>
          <p className="mt-2 text-slate-500">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Masuk di sini
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <EnvelopeSimple className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <LockKey className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 char"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {show ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Konfirmasi</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <LockKey className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Ulangi"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 disabled:opacity-50"
            >
              Daftar Sekarang <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            Dengan mendaftar, Anda menyetujui{" "}
            <a href="#" className="font-semibold text-slate-700 hover:text-blue-600">Syarat Ketentuan</a> dan{" "}
            <a href="#" className="font-semibold text-slate-700 hover:text-blue-600">Kebijakan Privasi</a> KiosHosting.
          </p>
        </div>
      </div>
    </div>
  );
}
