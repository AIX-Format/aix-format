"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Activity, Volume2, Settings } from "lucide-react";
import type { VoiceState } from "@/lib/aix/schema";
import { cn } from "@/lib/utils";

interface VoiceOrbProps {
  state?: VoiceState;
  onTranscript?: (text: string) => void;
  isProcessing?: boolean;
  size?: number;
  label?: string;
}

const stateLabel: Record<VoiceState, string> = {
  idle: "في الاستراحة",
  listening: "ينصت",
  processing: "يفكّر",
  speaking: "يتحدّث",
};

export function VoiceOrb({ 
  state: externalState, 
  onTranscript, 
  isProcessing: externalProcessing,
  size = 220,
  label 
}: VoiceOrbProps) {
  const [internalState, setInternalState] = useState<VoiceState>("idle");
  const recognitionRef = useRef<any>(null);
  const prevProcessing = useRef(externalProcessing);

  // Derive active state
  const state = externalState || internalState;
  const isProcessing = externalProcessing || state === "processing";
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onTranscript) onTranscript(transcript);
        setInternalState("idle");
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setInternalState("idle");
      };

      recognitionRef.current.onend = () => {
        setInternalState("idle");
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [onTranscript]);

  useEffect(() => {
    if (prevProcessing.current && !externalProcessing && typeof window !== "undefined" && window.speechSynthesis) {
        speakText("Agent DNA generated successfully. Proceed to KYC verification.");
    }
    prevProcessing.current = externalProcessing;
  }, [externalProcessing]);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1.1;
    utterance.rate = 1.05;

    utterance.onstart = () => setInternalState("speaking");
    utterance.onend = () => setInternalState("idle");
    utterance.onerror = () => setInternalState("idle");

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (isListening) {
      recognitionRef.current.stop();
      setInternalState("idle");
    } else {
      recognitionRef.current.start();
      setInternalState("listening");
    }
  };

  const speed = isProcessing ? 1.2 : isSpeaking ? 1.5 : isListening ? 2.5 : 4;
  const scale = isSpeaking ? [1, 1.08, 1] : isListening ? [1, 1.03, 1] : [1, 1.02, 1];

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[rgba(20,20,30,0.4)] rounded-2xl border border-[var(--color-border)] backdrop-blur-xl gap-6">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-display font-medium text-white tracking-wide">
          {isSpeaking ? "Agent Speaking..." : isProcessing ? "Agent Analyzing..." : isListening ? "Listening..." : "Voice Orchestration"}
        </h3>
        <p className="text-xs text-gray-400">
          {isSpeaking ? "The Sovereign Engine is communicating." : "Speak to configure your AIX agent."}
        </p>
      </div>

      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Outer halo */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 50%, oklch(0.85 0.08 240 / 0.18), transparent 70%)",
          }}
          animate={{ scale: state === "idle" ? [1, 1.05, 1] : [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: speed, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Ring 3 */}
        <motion.div
          className="absolute rounded-full border border-white/10"
          style={{ width: size * 0.95, height: size * 0.95 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        {/* Ring 2 — animated */}
        <motion.div
          className="absolute rounded-full border border-white/15"
          style={{ width: size * 0.78, height: size * 0.78 }}
          animate={{ scale, rotate: isProcessing ? -360 : 0 }}
          transition={{
            scale: { duration: speed * 0.6, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          }}
        />

        {/* Ring 1 */}
        <motion.div
          className="absolute rounded-full border border-white/20"
          style={{ width: size * 0.6, height: size * 0.6 }}
          animate={{ scale }}
          transition={{ duration: speed * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Core Orb / Interaction Layer */}
        <motion.button
          onClick={toggleListening}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full transition-all duration-500",
            "backdrop-blur-2xl overflow-hidden",
            isListening ? "bg-gradient-primary shadow-[0_0_40px_rgba(0,219,233,0.6)]" : "bg-white/5"
          )}
          style={{
            width: size * 0.42,
            height: size * 0.42,
            background: isListening 
              ? undefined 
              : "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.95), oklch(0.85 0.06 240 / 0.5) 60%, oklch(0.65 0.08 250 / 0.3) 100%)",
            boxShadow: isListening 
              ? undefined 
              : "0 0 40px oklch(0.85 0.08 240 / 0.4), inset 0 -10px 30px oklch(0.5 0.1 260 / 0.4), inset 0 5px 20px oklch(1 0 0 / 0.6)",
          }}
        >
          {isProcessing ? (
            <Activity className="w-10 h-10 text-[var(--color-primary)] animate-pulse" />
          ) : isSpeaking ? (
            <Volume2 className="w-10 h-10 text-[#d2bbff] animate-pulse" />
          ) : isListening ? (
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["10px", "30px", "10px"] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  className="w-1.5 bg-white rounded-full"
                />
              ))}
            </div>
          ) : (
            <Mic className="w-10 h-10 text-white/80" />
          )}

          {/* Inner shimmer */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "conic-gradient(from 0deg, transparent, oklch(1 0 0 / 0.15), transparent, oklch(1 0 0 / 0.1), transparent)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </motion.button>
      </div>

      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {label ?? "AIX Status"}
        </div>
        <div className="mt-1 text-sm font-medium text-foreground/90">{stateLabel[state]}</div>
      </div>

      <div className="flex items-center gap-2 text-xs text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors">
        <Settings className="w-3 h-3" />
        <span>Voice Config (Hume / OpenAI)</span>
      </div>
    </div>
  );
}
