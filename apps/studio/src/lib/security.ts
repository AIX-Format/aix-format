import * as nacl from 'tweetnacl';
import { decodeUTF8, encodeUTF8, decodeBase64, encodeBase64 } from 'tweetnacl-util';

/**
 * AIX Security Suite
 * Handles signatures for MCP Tool responses and Dead Hand triggers.
 */

const KEY_PAIR = nacl.sign.keyPair(); // In production, this would be loaded from a secure vault

/**
 * Signs a tool response to prevent Cache Poisoning.
 */
export function signToolResponse(response: any): string {
  const message = JSON.stringify(response);
  const messageUint8 = decodeUTF8(message);
  const signature = nacl.sign.detached(messageUint8, KEY_PAIR.secretKey);
  return encodeBase64(signature);
}

/**
 * Verifies a tool response signature.
 */
export function verifyToolResponse(response: any, signature: string, publicKey: string): boolean {
  try {
    const message = JSON.stringify(response);
    const messageUint8 = decodeUTF8(message);
    const signatureUint8 = decodeBase64(signature);
    const publicKeyUint8 = decodeBase64(publicKey);
    return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
  } catch {
    return false;
  }
}

/**
 * Dead Hand Protocol Trigger
 * Checks if an identity should be "killed" due to inactivity.
 */
export function checkDeadHand(lastActiveAt: string, limitDays: number): boolean {
  const lastActive = new Date(lastActiveAt).getTime();
  const now = Date.now();
  const diffDays = (now - lastActive) / (1000 * 60 * 60 * 24);
  return diffDays > limitDays;
}

/**
 * Trust Score Entropy
 * Calculates a "behavioral randomness" factor to prevent Sybil/Gaming attacks.
 */
export function calculateBehavioralEntropy(responseTimes: number[]): number {
  if (responseTimes.length < 5) return 0; // Not enough data
  
  // Calculate variance in response times
  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const variance = responseTimes.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / responseTimes.length;
  
  // Higher variance (within reason) = more human-like randomness
  return Math.min(1, Math.sqrt(variance) / 100);
}
