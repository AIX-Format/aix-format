"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Shield, Cpu, Activity, Wallet, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PiUser {
  username: string;
  uid: string;
}

interface PiAuthResult {
  user: PiUser;
  accessToken: string;
}

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: unknown) => void
      ) => Promise<PiAuthResult>;
    };
  }
}

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/my-agents", label: "My Agents" },
  { href: "/network-status", label: "Network Status" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onIncompletePaymentFound = (payment: unknown) => {
    console.log("Incomplete payment found — will complete:", payment);
    // TODO: call your backend /payments/incomplete to complete or cancel
  };

  const handlePiAuth = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      if (typeof window !== "undefined" && window.Pi) {
        // Initialize Pi SDK v2.0
        window.Pi.init({ version: "2.0", sandbox: process.env.NODE_ENV !== "production" });

        // Request scopes: username (identity) + payments (wallet)
        const scopes = ["username", "payments"];
        const authResult: PiAuthResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

        setUser(authResult.user);
      } else {
        // Dev fallback — mock user outside Pi Browser
        console.warn("Pi SDK not loaded. Using development mock.");
        await new Promise(r => setTimeout(r, 1200));
        setUser({ username: "Pioneer_Dev", uid: "dev_uid_" + Math.random().toString(36).slice(2, 8) });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      console.error("Pi Auth Error:", err);
      setAuthError(message);
      setTimeout(() => setAuthError(null), 4000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    setUser(null);
    setShowUserMenu(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-[rgba(12,19,36,0.85)] backdrop-blur-xl border-[var(--color-glass-border)] py-4"
          : "bg-transparent border-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-[0_0_20px_rgba(0,219,233,0.3)] group-hover:shadow-[0_0_30px_rgba(0,219,233,0.5)] transition-shadow">
            <Cpu className="text-[var(--color-surface)] w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-tight text-white tracking-tight">Sovereign Studio</span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-primary)] font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3" /> Pi Network Secured
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-white"
                  : "text-[var(--color-on-surface-variant)] hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Zone */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute -top-10 right-0 bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap"
              >
                {authError}
              </motion.div>
            )}
          </AnimatePresence>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full border border-[var(--color-primary-dim)]/30 hover:border-[var(--color-primary)]/50 transition"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                <span className="text-sm font-medium text-white">{user.username}</span>
                <div className="h-4 w-[1px] bg-[var(--color-glass-border)] mx-1" />
                <span className="text-xs text-[var(--color-secondary)] flex items-center gap-1">
                  <Activity className="w-3 h-3" /> KYC Verified
                </span>
                <ChevronDown className={cn("w-3 h-3 text-gray-500 transition-transform", showUserMenu && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-panel-heavy rounded-xl border border-white/10 overflow-hidden shadow-2xl"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-gray-500">Connected as</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{user.username}</p>
                      <p className="text-[10px] font-mono text-gray-600 mt-0.5 truncate">{user.uid}</p>
                    </div>
                    <div className="px-2 py-2">
                      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">
                        <Wallet className="w-4 h-4" /> Pi Wallet
                      </button>
                      <button
                        onClick={handleDisconnect}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
                      >
                        <LogOut className="w-4 h-4" /> Disconnect
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePiAuth}
              disabled={isAuthenticating}
              className="relative overflow-hidden group px-6 py-2.5 rounded-full bg-[var(--color-surface-container-highest)] border border-[var(--color-glass-border)] hover:border-[var(--color-primary)]/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)] disabled:opacity-60"
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2 text-sm font-semibold text-white">
                {isAuthenticating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 text-[var(--color-primary)]" />
                    Connect Pi Wallet
                  </>
                )}
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
