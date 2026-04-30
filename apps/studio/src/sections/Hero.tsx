"use client";

import { motion } from "framer-motion";
import { Button } from "@/design-system/components";
import { ParticleBackground } from "@/components/animations/ParticleBackground";
import { Rocket, Globe, ShieldCheck, Cpu, ChevronRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Agents Published", value: "500+" },
  { label: "Verified MCP Servers", value: "50+" },
  { label: "Transactions", value: "$10K+" },
  { label: "Developers", value: "1000+" },
];

const badges = [
  { icon: ShieldCheck, text: "SLSA Level 2 Compliant" },
  { icon: Globe, text: "W3C DID Compatible" },
  { icon: Cpu, text: "MCP Native" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-mcp/20 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>
      
      <ParticleBackground />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl lg:text-[96px] font-black tracking-tighter leading-[0.9] text-white uppercase italic mb-6">
            The Trust Infrastructure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-mcp to-primary-light">
              for the Agent Economy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Build, verify, and monetize AI agents with the <span className="text-white font-bold">AIX open standard</span>. 
            Sovereign identity, cryptographic provenance, and seamless discovery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/builder">
              <Button size="lg" className="px-10 py-8 text-lg group">
                Launch Studio
                <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="lg" className="px-10 py-8 text-lg">
                Explore Marketplace
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/5 bg-surface-1/50 backdrop-blur-md rounded-3xl mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-3xl md:text-4xl font-black text-white"
                >
                  {stat.value}
                </motion.span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                <badge.icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">{badge.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/10 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
}
