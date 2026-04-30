'use client';

import { useState, useCallback } from 'react';
import { DeployRequest, DeployResponse, DeploymentRecord } from '@/lib/types';

/**
 * useDeployment Hook
 * Manages agent deployment orchestration to Vercel or custom nodes.
 */
export function useDeployment() {
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDeployment, setLastDeployment] = useState<DeploymentRecord | null>(null);

  const deployAgent = useCallback(async (request: DeployRequest) => {
    setIsDeploying(true);
    setError(null);
    try {
      const response = await fetch('/api/deploy-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data: DeployResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      const deployment: DeploymentRecord = {
        agentId: request.agentId,
        deployedAt: new Date().toISOString(),
        endpointUrl: data.deployUrl,
        mcpUrl: `${data.deployUrl}/api/mcp-discovery`,
        status: 'deployed',
      };

      setLastDeployment(deployment);
      return deployment;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown deployment error';
      setError(msg);
      throw err;
    } finally {
      setIsDeploying(false);
    }
  }, []);

  return {
    deployAgent,
    isDeploying,
    error,
    lastDeployment
  };
}
