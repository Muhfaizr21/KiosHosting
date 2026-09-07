import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeSimple, LockKey, Eye, EyeSlash, ArrowRight, HardDrives, ArrowLeft } from "@phosphor-icons/react";
import { login } from "../../lib/auth";
import { Logo } from "../../components/ui/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Email tidak valid.");
    if (password.length < 6) return setError("Kata sandi minimal 6 karakter.");
    try {
      setLoading(true);
      const result = await login(email, password);
      navigate(result.session.role === "superadmin" ? "/admin" : "/dashboard");
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
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-block transition-opacity hover:opacity-90">
            <Logo theme="dark" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight text-white mb-6">
            Solusi Cloud Hosting Cepat & Andal.
          </h1>
          <p className="text-lg text-slate-300">
            Kelola infrastruktur digital Anda dengan performa tinggi, keamanan maksimal, dan dukungan 24/7.
          </p>
          
          <div className="mt-12 rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-3">Akun Demo Tersedia</h3>
            <div className="space-y-2 font-mono text-xs text-slate-300">
              <p className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-blue-400">Superadmin:</span> 
                <span>admin@kioshosting.id / admin123</span>
              </p>
              <p className="flex justify-between pt-1">
                <span className="text-emerald-400">User:</span> 
                <span>budi@gmail.com / user1234</span>
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} KiosHosting.id. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-20 xl:px-32">
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

          <h2 className="font-display text-3xl font-bold text-slate-900">Masuk ke akun</h2>
          <p className="mt-2 text-slate-500">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Daftar gratis
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Lupa password?</a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <LockKey className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {show ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-start gap-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 disabled:opacity-50"
            >
              Masuk Sekarang <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Aplikasi demo berjalan secara lokal. Data login di atas digunakan untuk simulasi.
          </p>
        </div>
      </div>
    </div>
  );
}
