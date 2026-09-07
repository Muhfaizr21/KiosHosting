import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Menu, X, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Fitur", href: "#fitur" },
    { name: "Target Pasar", href: "#audiens" },
    { name: "Harga", href: "#harga" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-ink-950/90 backdrop-blur-md border-b border-slate-800/60 shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="bg-cyan-500 p-1.5 rounded-md">
              <Server className="h-4 w-4 text-ink-950" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              KiosHosting
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Masuk
            </Button>
            <Button size="sm" onClick={() => navigate("/register")}>
              Daftar Sekarang
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-ink-950/95 backdrop-blur-md border-b border-slate-800"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-sm text-slate-300 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-3 mt-3 border-t border-slate-800 flex flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={() => { navigate("/login"); setMobileOpen(false); }}>
                  Masuk
                </Button>
                <Button className="w-full" onClick={() => { navigate("/register"); setMobileOpen(false); }}>
                  Daftar Sekarang
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
