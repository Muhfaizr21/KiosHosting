import React, { useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { HardDrives, SignOut, House, CreditCard, Lifebuoy, GearSix } from "@phosphor-icons/react";
import { getSession, logout, seedAuth } from "../../lib/auth";

const navItems = [
  { icon: House, label: "Overview", path: "/dashboard" },
  { icon: HardDrives, label: "Layanan", path: "/dashboard/service/1" },
  { icon: CreditCard, label: "Tagihan", path: "/dashboard/billing" },
  { icon: Lifebuoy, label: "Support", path: "/dashboard/support" },
  { icon: GearSix, label: "Pengaturan", path: "/dashboard/settings" },
];

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();

  useEffect(() => {
    seedAuth();
  }, []);

  useEffect(() => {
    if (!session) navigate("/login");
  }, [session, navigate]);

  if (!session) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <div className="flex flex-1 w-full relative">
        {/* Sidebar */}
        <aside className="sticky top-0 h-screen hidden w-[280px] shrink-0 border-r border-slate-200/60 bg-white px-5 py-6 lg:flex lg:flex-col overflow-y-auto">
          <Link to="/" className="flex items-center gap-3 rounded-2xl px-2 py-2 group shrink-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20 transition-transform group-hover:scale-105">
              <span className="font-display font-bold text-lg">K</span>
            </span>
            <div>
              <p className="font-display text-sm font-bold tracking-tight text-slate-900">KiosHosting</p>
              <p className="text-xs font-medium text-slate-500">Client Area</p>
            </div>
          </Link>

          <nav className="mt-8 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.path === '/dashboard' 
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path.split('/')[2] ? `/dashboard/${item.path.split('/')[2]}` : item.path);
              
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    active 
                      ? "bg-violet-50 text-violet-700 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon weight={active ? "fill" : "duotone"} className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-100 bg-slate-50 p-4 shrink-0">
            <p className="text-sm font-semibold text-slate-900">{session.name}</p>
            <p className="mt-0.5 text-xs text-slate-500 truncate">{session.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Online</p>
            </div>
          </div>

          <button onClick={handleLogout} className="mt-3 shrink-0 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-red-600">
            <SignOut className="h-4 w-4" /> Keluar
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-2 lg:hidden">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                    <span className="font-display font-bold text-lg">K</span>
                  </span>
                </Link>
                <div>
                  <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">Client Portal</h1>
                  <p className="text-sm font-medium text-slate-500">Welcome back, {session.name.split(' ')[0]}!</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-medium text-slate-500 sm:block">{session.email}</span>
                <button onClick={handleLogout} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-red-600 lg:hidden">
                  <SignOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 w-full pb-20">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
