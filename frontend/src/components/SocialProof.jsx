import React from "react";
import { Server, Clock, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function SocialProof() {
  return (
    <section className="py-16 bg-ink-900/70 border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "Tier-3", label: "Datacenter Jakarta", icon: <Server className="h-5 w-5 text-cyan-400" /> },
            { value: "99.9%", label: "Garansi Uptime", icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> },
            { value: "<15 mnt", label: "Respon Teknis", icon: <Clock className="h-5 w-5 text-amber-400" /> },
            { value: "100%", label: "Bantuan Migrasi", icon: <Zap className="h-5 w-5 text-violet-400" /> },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center p-4"
            >
              <div className="flex justify-center mb-3">{item.icon}</div>
              <p className="text-2xl font-bold text-white font-display">{item.value}</p>
              <p className="text-sm text-slate-400 mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
