"use client";

import { motion } from "framer-motion";
import { FadeIn, StaggerContainer } from "@/components/animations/FadeIn";
import { Badge } from "@/design-system/components";
import { Edit3, Layers, ShieldCheck, Rocket } from "lucide-react";

const steps = [
  {
    title: "Define",
    description: "Use the AIX Studio to define your agent's persona, capabilities, and sovereign identity.",
    icon: Edit3,
    color: "bg-blue-500"
  },
  {
    title: "Build",
    description: "Connect MCP servers and integrate tools with simple configurations. Build complex recursive agents.",
    icon: Layers,
    color: "bg-purple-500"
  },
  {
    title: "Verify",
    description: "Sign your agent manifest and verify its identity, ABOM integrity, and capability restrictions.",
    icon: ShieldCheck,
    color: "bg-emerald-500"
  },
  {
    title: "Deploy",
    description: "Push your agent to any compatible infrastructure or marketplace. Start monetizing immediately.",
    icon: Rocket,
    color: "bg-primary"
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden bg-surface-1/30">
      <div className="container mx-auto px-4">
        <FadeIn className="text-center mb-20">
          <Badge variant="outline" className="mb-4">Workflow</Badge>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
            How It Works
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            From architecture to deployment, AIX provides a streamlined pipeline for professional agent development.
          </p>
        </FadeIn>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 z-0" />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <FadeIn key={i} direction="up" delay={i * 0.1} className="relative">
                <div className="flex flex-col items-center text-center group">
                  <div className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500`}>
                    <step.icon className="w-10 h-10 text-white" />
                    
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black font-black flex items-center justify-center text-sm shadow-xl">
                      {i + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tight group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-foreground/50 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
