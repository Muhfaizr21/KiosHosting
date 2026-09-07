import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { ArrowRight, ShieldCheck, Zap, Activity, HardDrive, Server, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#030712] pt-24 pb-20">
      
      {/* Abstract Glowing Aurora Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/30 blur-[120px] rounded-[100%]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            rotate: [0, -90, 0],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/20 blur-[130px] rounded-full" 
        />
        {/* Soft Fades for edges */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#030712] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#030712] to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center">
        


        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="font-display text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1] text-white max-w-4xl mb-6"
        >
          Hosting Super Cepat,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
            Untuk Bisnis Modern.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-light"
        >
          Tingkatkan performa website Anda dengan infrastruktur NVMe berkecepatan tinggi, perlindungan L7 DDoS, dan garansi uptime 99.9%.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <Button size="lg" onClick={() => navigate("/register")} className="h-14 px-8 text-base bg-white text-ink-950 hover:bg-slate-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all gap-2 group">
            Mulai Perjalanan Anda
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById("harga")?.scrollIntoView({ behavior: "smooth" })} className="h-14 px-8 text-base border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
            Lihat Harga
          </Button>
        </motion.div>

        {/* Floating Dashboard Art Piece */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-4xl mx-auto perspective-[2000px]"
        >
          {/* Decorative glow behind dashboard */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/30 to-cyan-400/30 blur-[80px] -z-10 rounded-[3rem]" />
          
          <motion.div 
            animate={{ 
              y: [-10, 10, -10],
              rotateX: [1.5, -1.5, 1.5],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full rounded-2xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/5"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Window Controls */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 bg-white/[0.02]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <div className="mx-auto flex items-center gap-2 text-slate-500 text-xs font-mono">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                sys.monitoring.kioshosting.id
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6 text-left">
              
              {/* Col 1 */}
              <div className="col-span-2 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-white font-medium text-lg mb-1">Server Metrics</h3>
                    <p className="text-slate-400 text-sm">Real-time resource utilization</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium text-emerald-400">All Systems Operational</span>
                  </div>
                </div>

                {/* Big Chart Area */}
                <div className="h-44 rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-end gap-1.5 overflow-hidden relative">
                  <div className="absolute top-4 left-4">
                    <span className="text-3xl font-display font-bold text-white">4.8<span className="text-lg text-slate-500 font-sans">k</span></span>
                    <p className="text-xs text-cyan-400 mt-1">Requests per second</p>
                  </div>
                  {/* Fake wave bars (Equalizer effect) */}
                  <div className="w-full flex items-end gap-1 h-28 opacity-80">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t-sm"
                        initial={{ height: "20%" }}
                        animate={{ height: [`${Math.random() * 60 + 20}%`, `${Math.random() * 80 + 20}%`, `${Math.random() * 60 + 20}%`] }}
                        transition={{ duration: Math.random() * 1.5 + 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Grid info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-slate-400">NVMe I/O</span>
                      </div>
                      <div className="text-lg font-mono text-white">950 <span className="text-xs text-slate-500">MB/s</span></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-400">DDoS Status</span>
                      </div>
                      <div className="text-lg font-mono text-white">Protected</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2 */}
              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-white/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 h-full flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
                  
                  <Server className="w-8 h-8 text-indigo-400 mb-4" />
                  <h4 className="text-white font-medium mb-2">Global Edge Network</h4>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    Akselerasi kecepatan akses hingga 10x lipat dengan sistem cache terdistribusi.
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Latency</span>
                        <span className="text-cyan-400 font-mono">1.2ms</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/4 bg-cyan-400 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Uptime</span>
                        <span className="text-emerald-400 font-mono">99.9%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[99.9%] bg-emerald-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Floating badges */}
          <motion.div 
            animate={{ y: [-8, 8, -8], rotate: [0, 4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-6 md:-right-12 top-1/4 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl flex items-center gap-3"
          >
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Clock className="w-4 h-4" /></div>
            <div className="text-sm font-medium text-white pr-2">Uptime Guarantee</div>
          </motion.div>

          <motion.div 
            animate={{ y: [8, -8, 8], rotate: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -left-6 md:-left-12 bottom-1/4 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl flex items-center gap-3"
          >
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Zap className="w-4 h-4" /></div>
            <div className="text-sm font-medium text-white pr-2">Ultra Low Latency</div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

