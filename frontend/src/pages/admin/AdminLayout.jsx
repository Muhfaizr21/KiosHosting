import React, { useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { 
  Users, CreditCard, HardDrives, ShieldCheck, 
  SignOut, ChartPieSlice, Tag, Lifebuoy, GearSix, Bank,
  Cpu, Globe 
} from "@phosphor-icons/react";
import { Logo } from "../../components/ui/Logo";
import { getSession, logout, seedAuth } from "../../lib/auth";

const navSections = [
  {
    title: "Ringkasan & Klien",
    items: [
      { icon: ChartPieSlice, label: "Overview", path: "/admin" },
      { icon: Users, label: "Clients", path: "/admin/clients" },
    ],
  },
  {
    title: "Infrastruktur & Server",
    items: [
      { icon: Cpu, label: "Provisioning", path: "/admin/provisioning" },
      { icon: Globe, label: "Domains & DNS", path: "/admin/domains" },
      { icon: HardDrives, label: "Server Nodes", path: "/admin/nodes" },
    ],
  },
  {
    title: "Keuangan & Billing",
    items: [
      { icon: CreditCard, label: "Billing & Invoices", path: "/admin/billing" },
      { icon: Bank, label: "Finance & COA", path: "/admin/finance" },
      { icon: Tag, label: "Katalog Produk", path: "/admin/products" },
    ],
  },
  {
    title: "Sistem & Keamanan",
    items: [
      { icon: ShieldCheck, label: "Security & WAF", path: "/admin/security" },
      { icon: Lifebuoy, label: "Support Tickets", path: "/admin/support" },
      { icon: GearSix, label: "System Settings", path: "/admin/settings" },
    ],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();

  useEffect(() => {
    seedAuth();
  }, []);

  useEffect(() => {
    if (!session || session.role !== "superadmin") navigate("/login");
  }, [session, navigate]);

  if (!session || session.role !== "superadmin") return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentPath = location.pathname;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans [color-scheme:light]" style={{ colorScheme: "light" }}>
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen hidden w-[260px] shrink-0 flex-col bg-slate-900 text-white p-4 lg:flex overflow-y-auto">
        <Link to="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2 group">
          <Logo iconOnly theme="dark" size="sm" className="transition-transform group-hover:scale-105" />
          <div>
            <span className="font-display text-sm font-bold tracking-wide">KiosHosting</span>
            <span className="block text-[10px] font-medium text-blue-300 uppercase tracking-widest">Superadmin</span>
          </div>
        </Link>
        
        <nav className="mt-6 flex flex-col gap-4 flex-1">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/70 font-mono">
                {section.title}
              </div>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.path === "/admin"
                      ? currentPath === "/admin"
                      : currentPath.startsWith(item.path);
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        active
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon weight={active ? "fill" : "duotone"} className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 shrink-0">
          <div className="rounded-xl bg-white/5 px-3 py-3">
            <p className="text-sm font-semibold">{session.name}</p>
            <p className="mt-0.5 text-xs text-slate-400 truncate">{session.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">System Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-red-400">
            <SignOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors lg:hidden">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">Command Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 sm:block">Superadmin Mode</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
