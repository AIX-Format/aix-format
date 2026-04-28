"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Fingerprint, KeyRound, Check, Loader2 } from "lucide-react";
import { useIdentityStore } from "@/store/identity";
import { useSignalStore } from "@/store/signals";
import { sha256Hex, shortHash } from "@/lib/aix/hash";
import { cn } from "@/lib/utils";

interface KycSignatureModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  { id: 0, title: "Pi KYC", icon: ShieldCheck, desc: "تحقق من الهوية عبر شبكة Pi" },
  { id: 1, title: "did:axiom", icon: Fingerprint, desc: "توليد معرّف ذاتي السيادة" },
  { id: 2, title: "Sign", icon: KeyRound, desc: "توقيع التزام بمفتاحك الخاص" },
];

export function KycSignatureModal({ open, onClose }: KycSignatureModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { kycStatus, did, setDid, setKyc } = useIdentityStore();
  const { push: addSignal } = useSignalStore();

  const handleStart = async () => {
    setIsProcessing(true);
    setKyc("pending");

    // Step 0: Pi KYC
    setCurrentStep(0);
    await new Promise((r) => setTimeout(r, 1500));

    // Step 1: Generate DID
    setCurrentStep(1);
    const mockDid = "did:axiom:axiomid.app:1234567890abcdef";
    setDid(mockDid);

    // Step 2: Sign
    setCurrentStep(2);
    await new Promise((r) => setTimeout(r, 1000));

    setKyc("verified", "mock-signature-jws");

    addSignal({
      kind: "success",
      source: "KycAdapter",
      message: "Agent identity anchored and signed via Pi Network.",
    });

    setIsProcessing(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">Sovereign Protocol</h2>
                  <p className="text-xs text-white/50">Authenticate via Pi Network KYC</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Steps */}
              <div className="flex justify-between relative">
                <div className="absolute left-8 right-8 top-5 h-[2px] bg-white/5 -z-10" />
                {steps.map((s) => {
                  const isActive = currentStep >= s.id;
                  const isCurrent = currentStep === s.id;
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-3">
                      <motion.div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                          isActive ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 bg-black/50 text-white/30"
                        )}
                        animate={isCurrent && isProcessing ? { scale: [1, 1.1, 1], boxShadow: ["0 0 0 0 rgba(59,130,246,0)", "0 0 0 10px rgba(59,130,246,0.2)", "0 0 0 0 rgba(59,130,246,0)"] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Icon size={18} />
                      </motion.div>
                      <div className="text-center">
                        <p className={cn("text-xs font-medium", isActive ? "text-white" : "text-white/40")}>{s.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Display */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center min-h-[140px] flex flex-col items-center justify-center">
                {(kycStatus === "idle" || kycStatus === "failed") && !isProcessing ? (
                  <div className="space-y-4">
                    <Fingerprint className="mx-auto text-white/40" size={32} />
                    <p className="text-sm text-white/60">
                      We require a cryptographic signature bound to your Pi Network identity to issue an AxiomID.
                    </p>
                  </div>
                ) : kycStatus === "verified" && !isProcessing ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      <Check size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Identity Verified</p>
                      <p className="text-xs font-mono text-green-400/80 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 inline-block">
                        {did}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <Loader2 className="mx-auto text-blue-400 animate-spin" size={32} />
                    <p className="text-sm text-white/80 animate-pulse">
                      {currentStep === 0 && "Handshaking with Pi Network..."}
                      {currentStep === 1 && "Generating Zero-Knowledge Proofs..."}
                      {currentStep === 2 && "Signing AIX Manifest..."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {kycStatus === "verified" ? "Close" : "Cancel"}
              </button>

              {kycStatus !== "verified" && (
                <button
                  onClick={handleStart}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Fingerprint size={16} />
                      Authenticate
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
