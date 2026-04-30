/**
 * AIX ABOM Risk Scanner — Studio local copy
 * Mirrors core/abom-scanner.ts so apps/studio builds self-contained.
 * Full scoring logic: penalises missing security fields, high-risk
 * permissions, untrusted registries, and absent provenance.
 */

export interface AbomScanResult {
  score: number; // 0-100 (100 = safest)
  risks: string[];
  tier: "safe" | "moderate" | "high" | "critical";
}

const PENALISED_PERMISSIONS = [
  "read:filesystem",
  "write:filesystem",
  "network:unrestricted",
  "exec:shell",
  "access:secrets",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function scanAgent(manifest: Record<string, any>): AbomScanResult {
  let score = 100;
  const risks: string[] = [];

  // 1. Check ABOM block exists
  if (!manifest?.abom) {
    score -= 20;
    risks.push("Missing ABOM block");
  }

  // 2. Penalise dangerous permissions
  const permissions: string[] =
    manifest?.abom?.permissions ?? manifest?.permissions ?? [];
  for (const perm of PENALISED_PERMISSIONS) {
    if (permissions.includes(perm)) {
      score -= 10;
      risks.push(`High-risk permission: ${perm}`);
    }
  }

  // 3. Check build provenance
  if (!manifest?.abom?.build_provenance && !manifest?.build_provenance) {
    score -= 10;
    risks.push("Missing build_provenance");
  }

  // 4. Check saas_services for untrusted origins
  const saasServices: Array<{ provider?: string; trusted?: boolean }> =
    manifest?.abom?.saas_services ?? [];
  for (const svc of saasServices) {
    if (svc.trusted === false) {
      score -= 5;
      risks.push(`Untrusted SaaS service: ${svc.provider ?? "unknown"}`);
    }
  }

  // 5. Check required identity fields
  if (!manifest?.agent?.did && !manifest?.did) {
    score -= 10;
    risks.push("Missing agent DID");
  }
  if (!manifest?.agent?.name && !manifest?.name) {
    score -= 5;
    risks.push("Missing agent name");
  }

  score = Math.max(0, Math.min(100, score));

  let tier: AbomScanResult["tier"] = "safe";
  if (score < 40) tier = "critical";
  else if (score < 60) tier = "high";
  else if (score < 80) tier = "moderate";

  return { score, risks, tier };
}

export default scanAgent;
