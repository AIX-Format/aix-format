import { kv } from "@vercel/kv";
import { RegistryEntry } from "./types";

const KV_KEY = "aix_registry";

export async function getRegistry(): Promise<RegistryEntry[]> {
  try {
    const entries = await kv.get<RegistryEntry[]>(KV_KEY);
    return entries || [];
  } catch (error) {
    console.warn("KV Registry not available, falling back to empty list", error);
    return [];
  }
}

export async function saveRegistry(entries: RegistryEntry[]): Promise<void> {
  try {
    await kv.set(KV_KEY, entries);
  } catch (error) {
    console.error("Failed to save to KV registry:", error);
    throw new Error("Registry persistence failure");
  }
}

export async function updateRegistryEntry(entry: RegistryEntry): Promise<void> {
  const entries = await getRegistry();
  const index = entries.findIndex(e => e.did === entry.did);
  
  if (index !== -1) {
    entries[index] = entry;
  } else {
    entries.push(entry);
  }
  
  await saveRegistry(entries);
}

export async function deleteRegistryEntry(did: string): Promise<void> {
  const entries = await getRegistry();
  const filtered = entries.filter(e => e.did !== did);
  await saveRegistry(filtered);
}
