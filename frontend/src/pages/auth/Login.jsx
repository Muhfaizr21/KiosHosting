import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeSimple, LockKey, Eye, EyeSlash, ArrowRight, HardDrives } from "@phosphor-icons/react";
import { seedAuth, login } from "../../lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    seedAuth();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Email tidak valid.");
    if (password.length < 6) return setError("Kata sandi minimal 6 karakter.");
    const result = login(email, password);
    if (result.error) return setError(result.error);
    navigate(result.session.role === "superadmin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-ink-950">
        <div className="absolute inset-0 bg-[radial-gradient(800px_500px_at_20%_-10%,rgba(168,85,247,0.22),transparent_60%),radial-gradient(600px_400px_at_85%_20%,rgba(139,92,246,0.14),transparent_55%)]" />
      </div>
      <div className="mx-auto grid min-h-screen max-w-[1280px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400 text-ink-950 shadow-glow-violet"><HardDrives weight="fill" className="h-5 w-5" /></span>
            <span className="font-display text-lg font-semibold text-white">KiosHosting<span className="font-normal text-violet-300">.id</span></span>
          </Link>
          <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Selamat datang kembali.</h1>
          <p className="mt-4 max-w-md text-[17px] leading-7 text-white/65">Masuk untuk kelola layanan, lihat tagihan, dan pantau status website-mu dari satu tempat.</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/70">
            <p className="font-semibold text-white">Akun demo seeder</p>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-white/60">
              <p><span className="text-violet-300">Superadmin:</span> admin@kioshosting.id / admin123</p>
              <p><span className="text-cyan-300">User:</span> budi@gmail.com / user1234</p>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-white">Masuk ke akun</h2>
          <p className="mt-2 text-sm text-white/60">Belum punya akun? <Link to="/register" className="font-semibold text-violet-300 hover:text-violet-200">Daftar gratis</Link></p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/80">Email</span>
              <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-ink-950 px-4">
                <EnvelopeSimple className="h-5 w-5 text-white/40" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full bg-transparent text-white placeholder:text-white/35 focus:outline-none" />
              </div>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white/80">Kata sandi</span>
              <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-ink-950 px-4">
                <LockKey className="h-5 w-5 text-white/40" />
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full bg-transparent text-white placeholder:text-white/35 focus:outline-none" />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label="Lihat kata sandi" className="text-white/50 hover:text-white">{show ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </label>
            {error && <p className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-violet-400 px-6 text-sm font-semibold text-ink-950 shadow-glow-violet hover:bg-violet-300">Masuk <ArrowRight className="h-4 w-4" /></button>
          </form>
          <p className="mt-4 text-center text-xs text-white/40">Demo lokal. Data tersimpan di browser-mu.</p>
        </div>
      </div>
    </div>
  );
}
