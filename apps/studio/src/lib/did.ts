import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

/**
 * Generates a Sovereign Identity (DID) for an AIX Agent.
 * Format: did:web:axiomid.app:agents:{slug}-{nanoid}
 * 
 * @param agentName The human-readable name of the agent
 * @returns A unique DID string
 */
export function generateDID(agentName: string): string {
  const slug = agentName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
    
  return `did:web:axiomid.app:agents:${slug}-${nanoid()}`;
}

/**
 * Validates an AIX Agent DID.
 */
export function isValidDID(did: string): boolean {
  return /^did:web:axiomid\.app:agents:[a-z0-9-]+-[a-z0-9]{8}$/.test(did);
}
