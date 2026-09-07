import React from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { TargetAudience } from "./components/TargetAudience";
import { Pricing } from "./components/Pricing";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-950 text-slate-100 font-sans">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <TargetAudience />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
