export interface AgentRecord {
  id: string;
  name: string;
  role: string;
  createdAt: string;   // ISO 8601
  yaml: string;        // raw .aix file content
  did?: string;        // did:aix:<hash>
  kyc_tier?: 'unverified' | 'basic' | 'verified' | 'institutional';
  abom?: AbomRecord;
}

export interface AbomRecord {
  capabilities: string[];
  integrity_hash: string;
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
