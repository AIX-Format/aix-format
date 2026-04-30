// ⚠️ NO `any` POLICY — all types must be explicit.
// Run: cd apps/studio && npx tsc --noEmit before every commit.

export type DeployStatus = 
  'idle' | 'deploying' | 'deployed' | 'failed';

export interface DeploymentRecord {
  agentId: string;
  deployedAt: string;
  endpointUrl: string;      // e.g. https://axiomid.app/agents/{did}
  mcpUrl: string;           // e.g. https://axiomid.app/api/mcp-discovery
  status: DeployStatus;
  txHash?: string;          // wallet tx hash (for PROMPT 3)
  network?: string;         // 'ethereum' | 'polygon' (for PROMPT 3)
  signature?: string;       // Web3 signature
  signer?: string;          // Address of the signer
}

export interface RegistryEntry extends McpAgent {
  publishedAt: string;
  yaml: string;
  deployment?: DeploymentRecord;
  abom?: AbomData;
}

export interface AgentRecord {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  yaml: string;
  did?: string;
  kyc_tier?: 'unverified' | 'basic' | 'verified' | 'institutional';
  abom?: AbomData;
  deployment?: DeploymentRecord;
  // Extended fields for UI state
  color?: string;
  status?: 'online' | 'offline' | 'busy';
  successRate?: number;
  tasksCompleted?: number;
  published?: boolean;
}

export type NormalizedAgent = AgentRecord & { isMock: boolean };

// ─── Unified ABOM Data ─────────────────────────────────────────────────────
export interface AbomData {
  bom_format: 'CycloneDX' | 'SPDX' | 'AIX-NATIVE';
  spec_version: string;
  risk_level: 'low' | 'medium' | 'high';
  integrity_hash: string;
  capabilities: string[];
  dependencies: string[]; // constituents
  generated_by: string;
  timestamp: string;
  model?: {
    provider: string;
    name: string;
    version?: string;
  };
  dataset?: {
    sources: string[];
    cutoff_date?: string;
  };
  governance?: {
    license: string;
    contact?: string;
    txHash?: string; // Anchored on-chain (Sprint 4)
  };
}

export interface McpAgent {
  did: string;
  name: string;
  role: string;
  capabilities: string[];
  kyc_tier: string;
  specVersion: string;
}

export interface McpDiscoveryResponse {
  mcpVersion: string;
  generated: string;
  totalAgents: number;
  agents: McpAgent[];
}

export interface AgentSkill {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface McpPrompt {
  name: string;
  description?: string;
}

export interface Manifest {
  meta: {
    name: string;
    version: string;
    format_version: string;
    author: string;
    description: string;
  };
  persona: {
    role: string;
    instructions: string;
    tone: string;
  };
  skills: AgentSkill[];
  security: {
    checksum: {
      algorithm: string;
      value: string;
    }
  };
  identity_layer: {
    id: string;
    authority: string;
    issuedAt: string;
    kyc_tier?: number;
  };
  economics: {
    pricing_model: string;
    currency: string;
  };
  abom: AbomData;
  mcp: {
    prompts: McpPrompt[];
  }
}

export interface PiUser {
  uid: string;
  username: string;
}

export interface AuthResult {
  user: PiUser;
  accessToken: string;
}

// ─── New Deployment Types ──────────────────────────────────────────────────
export type DeployTarget = 'vercel' | 'custom';

export interface DeployConfig {
  token?: string;
  projectName?: string;
  endpointUrl?: string;
}

export interface DeployRequest {
  agentId: string;
  target: DeployTarget;
  config: DeployConfig;
  yaml: string;
}

export interface DeployResponse {
  deployUrl: string;
  status: 'deployed' | 'failed';
  error?: string;
}

export interface VercelDeployResponse {
  url: string;
  id: string;
  readyState: string;
}

// ─── Scan Result Types ─────────────────────────────────────────────────────
export interface RiskItem {
  category: 'Capability' | 'Supply Chain' | 'Identity' | 'Compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
}

export interface ComplianceReport {
  eu_cra: boolean;
  nist_ai_rmf: boolean;
  kyc_complete: boolean;
}

export interface ScanResult {
  score: number;           // 0-100
  grade: 'A'|'B'|'C'|'D'|'F';
  risks: RiskItem[];
  recommendations: string[];
  compliance: ComplianceReport;
  timestamp: string;
}

