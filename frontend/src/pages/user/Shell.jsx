import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HardDrives, SignOut, House, CreditCard, Lifebuoy, GearSix, Globe } from "@phosphor-icons/react";
import { getSession, logout, seedAuth } from "../../lib/auth";

const nav = [
  { icon: House, label: "Overview", to: "/dashboard" },
  { icon: CreditCard, label: "Tagihan", to: "/dashboard/tagihan" },
  { icon: Lifebuoy, label: "Support", to: "/dashboard/support" },
  { icon: GearSix, label: "Pengaturan", to: "/dashboard/pengaturan" },
  { icon: Globe, label: "Layanan", to: "/dashboard/layanan" },
];

export default function Shell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();

  useEffect(() => {
    seedAuth();
    if (!session) navigate("/login");
  }, [session, navigate]);

  if (!session) return null;

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-[280px] shrink-0 border-r border-zinc-200 bg-white px-5 py-6 lg:flex lg:flex-col">
          <Link to="/" className="flex items-center gap-3 rounded-2xl px-2 py-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <HardDrives weight="fill" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold tracking-tight">KiosHosting.id</p>
              <p className="text-xs text-zinc-500">Client Area</p>
            </div>
          </Link>

          <nav className="mt-8 flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to || (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"}`}
                >
                  <Icon weight={active ? "fill" : "duotone"} className="h-5 w-5" /> {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-zinc-900">{session.name}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{session.email}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">User</p>
          </div>

          <button onClick={onLogout} className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-100">
            <SignOut className="h-4 w-4" /> Keluar
          </button>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-xl font-semibold tracking-tight text-zinc-900">{title}</h1>
                {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/" className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700">Landing</Link>
                <button onClick={onLogout} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700">
                  <SignOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
