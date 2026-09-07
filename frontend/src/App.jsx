import React from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { SocialProof } from "./components/SocialProof";
import { WhyKiosHosting } from "./components/WhyKiosHosting";
import { Features } from "./components/Features";
import { TargetAudience } from "./components/TargetAudience";
import { Pricing } from "./components/Pricing";
import { FAQ } from "./components/FAQ";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-950 text-slate-100 font-sans selection:bg-cyan-400 selection:text-ink-950">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <WhyKiosHosting />
        <Features />
        <TargetAudience />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
