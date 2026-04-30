/**
 * ABOM Risk Scanner - AIX Protocol
 * Created by Jules (AIX UI/UX Architect) 2026
 *
 * Scoring and compliance engine for AI Agents based on the AIX Format.
 */

const KNOWN_MODEL_PROVIDERS = ['openai', 'anthropic', 'google', 'meta', 'mistral', 'cohere', 'aleph-alpha', 'deepseek'];
const DANGEROUS_CAPABILITIES = ['filesystem', 'network', 'shell', 'exec', 'subprocess', 'root_access'];

/**
 * Scans an AI Agent record and generates a risk report.
 * @param {Object} agent - The agent data (parsed AIX format)
 * @returns {Object} ScanReport
 */
export function scanAgent(agent) {
  let score = 0;
  const risks = [];
  const recommendations = [];
  const compliance = {
    eu_cra: false,
    nist_ai_rmf: false,
    kyc_complete: false,
  };

  if (!agent) {
    return { score: 0, grade: 'F', risks: [{ severity: 'critical', message: 'No agent data provided' }], recommendations: ['Provide a valid AIX manifest'], compliance };
  }

  // 1. Integrity Hash (+10)
  if (agent.abom?.integrity_hash) {
    score += 10;
  } else {
    risks.push({ severity: 'high', message: 'Missing ABOM integrity hash' });
    recommendations.push('Add an integrity_hash to the abom section to ensure manifest tampering detection.');
  }

  // 2. Known Model Provider (+10)
  const provider = agent.abom?.model?.provider?.toLowerCase();
  if (provider && KNOWN_MODEL_PROVIDERS.includes(provider)) {
    score += 10;
  } else {
    risks.push({ severity: 'medium', message: 'Unknown or missing model provider' });
    recommendations.push('Use a recognized model provider or document the custom provider transparency.');
  }

  // 3. Dataset Provenance (+10)
  if (agent.abom?.dataset?.provenance) {
    score += 10;
  } else {
    risks.push({ severity: 'medium', message: 'Missing dataset provenance' });
    recommendations.push('Document the dataset origin in abom.dataset.provenance for better transparency.');
  }

  // 4. Human Oversight (+15)
  if (agent.abom?.governance?.human_oversight === true) {
    score += 15;
  } else {
    risks.push({ severity: 'high', message: 'No human oversight documented' });
    recommendations.push('Enable human_oversight in governance settings to comply with EU CRA requirements.');
  }

  // 5. Identity DID (+10)
  if (agent.identity?.did) {
    score += 10;
  } else {
    risks.push({ severity: 'high', message: 'Missing Agent DID (Decentralized Identity)' });
    recommendations.push('Assign a did:axiom identity to your agent for cryptographic verifiability.');
  }

  // 6. KYC Tier Verified (+10)
  if (agent.kyc_tier === 'verified' || agent.identity?.kyc_tier === 'verified') {
    score += 10;
    compliance.kyc_complete = true;
  } else {
    risks.push({ severity: 'medium', message: 'KYC tier is not verified' });
    recommendations.push('Complete Pi KYC verification to reach the "verified" trust tier.');
  }

  // 7. Security Sandboxed (+10)
  if (agent.security?.sandboxed === true) {
    score += 10;
  } else {
    risks.push({ severity: 'critical', message: 'Agent is not sandboxed' });
    recommendations.push('Run the agent in a sandboxed environment to prevent host system compromise.');
  }

  // 8. Dangerous Capabilities & Governance (+10)
  const capabilities = agent.capabilities || [];
  const hasDangerous = capabilities.some(cap => DANGEROUS_CAPABILITIES.includes(cap));
  const hasGovernance = agent.abom?.governance?.rules?.length > 0;

  if (!hasDangerous || (hasDangerous && hasGovernance)) {
    score += 10;
  } else {
    risks.push({ severity: 'high', message: 'Dangerous capabilities enabled without explicit governance rules' });
    recommendations.push('Define governance rules if using sensitive capabilities like filesystem or network access.');
  }

  // 9. Valid Version (+5)
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
  if (agent.version && semverRegex.test(agent.version)) {
    score += 5;
  } else {
    risks.push({ severity: 'low', message: 'Invalid or missing version (SemVer expected)' });
    recommendations.push('Use semantic versioning (e.g., 1.0.0) for the agent version.');
  }

  // 10. Secure MCP Endpoints (+10)
  const endpoints = agent.mcp?.endpoints || [];
  const allSecure = endpoints.length > 0 && endpoints.every(url => url.startsWith('https://'));
  if (endpoints.length === 0 || allSecure) {
    score += 10;
  } else {
    risks.push({ severity: 'high', message: 'Insecure MCP endpoints detected (non-HTTPS)' });
    recommendations.push('Ensure all MCP endpoints use HTTPS to prevent man-in-the-middle attacks.');
  }

  // Final Grade calculation
  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 50) grade = 'D';

  // Compliance estimation
  compliance.eu_cra = score >= 80 && agent.abom?.governance?.human_oversight === true;
  compliance.nist_ai_rmf = score >= 70 && !!agent.abom?.integrity_hash;

  return {
    score,
    grade,
    risks,
    recommendations,
    compliance,
    timestamp: new Date().toISOString()
  };
}
