/**
 * AIX ABOM (Agent Bill of Materials) Scanner
 * 
 * Centralized security auditing for Agent Manifests.
 * Penalizes missing security fields, high-risk permissions, and untrusted sources.
 */

export interface AbomScanResult {
  riskScore: number; // 0-100 (100 = critical risk, 0 = safe)
  risks: string[];
  tier: "safe" | "moderate" | "high" | "critical";
}

const PENALIZED_PERMISSIONS = [
  "read:filesystem",
  "write:filesystem",
  "network:unrestricted",
  "exec:shell",
  "access:secrets",
];

export class AbomScanner {
  /**
   * Scan an agent manifest for security risks.
   * NO MOCKS.
   */
  static scan(manifest: any): AbomScanResult {
    let riskScore = 0;
    const risks: string[] = [];

    // 1. Check ABOM block
    if (!manifest?.abom) {
      riskScore += 25;
      risks.push("Missing ABOM security block");
    }

    // 2. Permissions Audit
    const permissions: string[] = manifest?.abom?.permissions || manifest?.permissions || [];
    for (const perm of PENALIZED_PERMISSIONS) {
      if (permissions.includes(perm)) {
        riskScore += 15;
        risks.push(`High-risk permission: ${perm}`);
      }
    }

    // 3. Provenance & Identity
    if (!manifest?.abom?.build_provenance) {
      riskScore += 10;
      risks.push("Missing build provenance");
    }
    
    if (!manifest?.did && !manifest?.agent?.did) {
      riskScore += 20;
      risks.push("Missing Agent DID (Identity)");
    }

    // 4. SaaS/Dependency Risk
    const services = manifest?.abom?.saas_services || [];
    for (const svc of services) {
      if (svc.trusted === false) {
        riskScore += 10;
        risks.push(`Untrusted SaaS dependency: ${svc.provider || "unknown"}`);
      }
    }

    // Cap at 100
    riskScore = Math.min(100, riskScore);

    let tier: AbomScanResult["tier"] = "safe";
    if (riskScore >= 90) tier = "critical";
    else if (riskScore >= 70) tier = "high";
    else if (riskScore >= 40) tier = "moderate";

    return { riskScore, risks, tier };
  }
}
