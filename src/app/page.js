"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  FaBolt,
  FaArrowRight,
  FaMagic,
  FaRocket,
  FaShieldAlt,
} from "react-icons/fa";
import { LoginButton } from "@/components/saas/AuthButtons";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex-1 flex flex-col bg-[#020202] text-white selection:bg-indigo-500/30 h-full w-full">
      <section className="relative h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(99,102,241,0.12),transparent_70%)] opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="relative z-10 max-w-5xl w-full flex flex-col items-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-sm text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase italic"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Engineering Visual Excellence
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85] italic mb-8"
          >
            NANO <br />
            <span className="text-white/20 outline-text">BANANA</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-bold tracking-tight uppercase"
          >
            The world's most modular SaaS engine for generative intelligence.{" "}
            <br className="hidden md:block" />
            Built for creators. Powered by muapi.ai.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-6 pt-8"
          >
            {session ? (
              <Link
                href="/editor"
                className="group relative h-16 px-12 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-[0_40px_100px_-40px_rgba(255,255,255,0.4)]"
              >
                Launch Image Editor
                <FaArrowRight className="text-indigo-600 transition-transform group-hover:translate-x-2" />
              </Link>
            ) : (
              <LoginButton className="!h-16 !px-12 !text-xs !tracking-[0.2em] !font-black !rounded-2xl !bg-white !text-black shadow-[0_40px_100px_-40px_rgba(255,255,255,0.4)]" />
            )}
            <Link
              href="/pricing"
              className="h-16 px-12 bg-white/[0.03] border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all hover:bg-white/10"
            >
              Explore Tiers
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-20 left-0 right-0 container mx-auto px-12 hidden lg:flex items-center justify-between opacity-20 transition-opacity hover:opacity-100 duration-1000">
          {[
            { icon: FaBolt, text: "High Speed Extraction" },
            { icon: FaShieldAlt, text: "Permanent Cold Storage" },
            { icon: FaMagic, text: "Smart Prompt Intelligence" },
            { icon: FaRocket, text: "Multi-Tier Scaling" },
          ].map((feat) => (
            <div
              key={feat.text}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:border-white/20 border border-transparent transition-all">
                <feat.icon className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                {feat.text}
              </span>
            </div>
          ))}
        </div>
      </section>
      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}
