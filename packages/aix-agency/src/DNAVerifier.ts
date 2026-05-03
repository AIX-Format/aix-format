import { generateDNAFingerprint } from '../../aix-core/src/security/dna.js';

export interface IntegrityResult {
  valid: boolean;
  hash: string;
  tamperDetails?: string;
}

export async function verifyAgentIntegrity(agent: any): Promise<IntegrityResult> {
  const existingHash = agent.identity_layer?.dna_hash;

  if (!existingHash) {
    return {
      valid: false,
      hash: '',
      tamperDetails: 'Missing DNA hash'
    };
  }

  // To verify, we remove the existing hash and recalculate it
  const agentToVerify = JSON.parse(JSON.stringify(agent));
  delete agentToVerify.identity_layer.dna_hash;

  const expectedHash = generateDNAFingerprint(agentToVerify);

  if (existingHash !== expectedHash) {
    return {
      valid: false,
      hash: existingHash,
      tamperDetails: `DNA hash mismatch. Expected ${expectedHash}, got ${existingHash}`
    };
  }

  return {
    valid: true,
    hash: existingHash
  };
}
