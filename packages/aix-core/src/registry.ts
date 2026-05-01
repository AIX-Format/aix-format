import { kv, KEYS, NS } from './index';

/**
 * AIX Global Agent Registry Manager
 * Handles server-side persistence for agent manifests.
 */

const GLOBAL_INDEX_KEY = `${NS.REGISTRY}:index`;

export interface RegistryEntry {
  did: string;
  name: string;
  role: string;
  capabilities: string[];
  kyc_tier: string;
  specVersion: string;
  publishedAt: string;
  yaml: string;
}

/**
 * Retrieves all agents from the global registry.
 */
export async function getRegistry(): Promise<RegistryEntry[]> {
  try {
    const dids = await kv.get<string[]>(GLOBAL_INDEX_KEY);
    if (!dids || dids.length === 0) return [];

    const entries = await Promise.all(
      dids.map(did => kv.get<RegistryEntry>(KEYS.registry(did)))
    );

    return entries.filter((e): e is RegistryEntry => e !== null);
  } catch (error) {
    console.warn("[RegistryManager] Failed to fetch registry:", error);
    return [];
  }
}

/**
 * Upserts a single entry in the registry.
 */
export async function updateRegistryEntry(entry: RegistryEntry): Promise<void> {
  const did = entry.did;
  await kv.set(KEYS.registry(did), entry);

  const dids = await kv.get<string[]>(GLOBAL_INDEX_KEY) || [];
  if (!dids.includes(did)) {
    dids.push(did);
    await kv.set(GLOBAL_INDEX_KEY, dids);
  }
}

/**
 * Removes an entry from the registry by DID.
 */
export async function deleteRegistryEntry(did: string): Promise<void> {
  await kv.del(KEYS.registry(did));

  const dids = await kv.get<string[]>(GLOBAL_INDEX_KEY) || [];
  const filtered = dids.filter(d => d !== did);
  await kv.set(GLOBAL_INDEX_KEY, filtered);
}
