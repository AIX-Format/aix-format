import { z } from 'zod';

/**
 * AIX Sovereign Circuit Breaker (RULE 8)
 * Protects providers from cascading failures.
 * Status: CLOSED, OPEN, HALF_OPEN
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  name: string;
}

export const CircuitConfigSchema = z.object({
  failureThreshold: z.number().default(3),
  recoveryTimeout: z.number().default(9000), // 9s (Tesla Harmony)
  name: z.string()
});

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private config: CircuitConfig;

  constructor(config: Partial<CircuitConfig> & { name: string }) {
    this.config = CircuitConfigSchema.parse(config);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptRecovery()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error(`[CircuitBreaker:${this.config.name}] Circuit is OPEN. Request blocked.`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
    this.lastFailureTime = null;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.error(`🚨 [CircuitBreaker:${this.config.name}] TRIP! Entering OPEN state.`);
    }
  }

  private shouldAttemptRecovery(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime > this.config.recoveryTimeout;
  }

  getState(): CircuitState {
    return this.state;
  }
}
