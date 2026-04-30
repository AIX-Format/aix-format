'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PiUser } from '@/lib/types';

/**
 * useKyc Hook
 * Manages the state and flow of the Agentic KYC process.
 */
export function useKyc(user?: PiUser) {
  const [step, setStep] = useState<number>(1);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Auto-start if user is provided and we are at step 1
  useEffect(() => {
    if (user && step === 1 && !isVerified) {
      startKyc();
    }
  }, [user, step, isVerified]);

  const startKyc = useCallback(() => {
    // Clear any previously queued timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setStep(2);

    const t1 = setTimeout(() => {
      setStep(3);
      const t2 = setTimeout(() => {
        setStep(4);
        setIsVerified(true);
      }, 2500);
      timersRef.current.push(t2);
    }, 2500);

    timersRef.current.push(t1);
  }, []);

  const resetKyc = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setStep(1);
    setIsVerified(false);
  }, []);

  return {
    step,
    isVerified,
    startKyc,
    resetKyc
  };
}
