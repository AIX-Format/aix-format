import { Manifest, AbomData, ScanResult, RiskItem, ComplianceReport } from '../apps/studio/src/lib/types';

/**
 * ABOM Scanner - Sovereign Risk Scoring Engine
 * Analyzes AIX manifests for security, compliance, and supply chain risks.
 */

export function scanAgent(agent: Partial<Manifest>): ScanResult {
  const risks: RiskItem[] = [];
  const recommendations: string[] = [];
  let score = 100; // Start with perfect score

  // Basic structure check
  const skills = agent.skills || [];
  const abom = agent.abom || {} as AbomData;
  const identity = agent.identity_layer || { kyc_tier: 0 };

  // 1. Analyze Capabilities (Skills)
  const highRiskSkills = ['filesystem_access', 'network_request', 'shell_exec', 'code_execution'];
  skills.forEach((skill) => {
    if (highRiskSkills.includes(skill.name)) {
      risks.push({
        category: 'Capability',
        severity: 'high',
        message: `High-risk capability detected: ${skill.name}`
      });
      score -= 15;
    }
  });

  // 2. Analyze Supply Chain (Dependencies)
  const deps = abom.dependencies || [];
  if (deps.length === 0) {
    risks.push({
      category: 'Supply Chain',
      severity: 'medium',
      message: 'No dependencies listed in ABOM. Integrity cannot be verified.'
    });
    recommendations.push('List all third-party models and libraries in the ABOM section.');
    score -= 10;
  } else {
    deps.forEach((depName: string) => {
      const untrusted = ['legacy-unverified-model', 'unsafe-adapter'];
      if (untrusted.some(u => depName.toLowerCase().includes(u))) {
        risks.push({
          category: 'Supply Chain',
          severity: 'critical',
          message: `Untrusted dependency detected: ${depName}`
        });
        score -= 25;
      }
    });
  }

  // 3. Identity & Trust
  const kycTier = identity.kyc_tier || 0;
  if (kycTier < 2) {
    risks.push({
      category: 'Identity',
      severity: 'medium',
      message: 'Agent author has low KYC trust tier.'
    });
    recommendations.push('Complete Level 2 KYC to improve agent trust score.');
    score -= 10;
  }

  // 4. Compliance Checks
  const compliance: ComplianceReport = {
    eu_cra: score > 70 && deps.length > 0,
    nist_ai_rmf: score > 60 && !!abom.risk_level,
    kyc_complete: kycTier >= 2
  };

  // Grade calculation
  let grade: ScanResult['grade'] = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';

  return {
    score: Math.max(0, score),
    grade,
    risks,
    recommendations,
    compliance,
    timestamp: new Date().toISOString()
  };
}

