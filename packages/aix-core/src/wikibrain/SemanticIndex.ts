import { pipeline } from '@xenova/transformers';
import { z } from 'zod';
import { kv } from '../storage/adapter';
import { KEYS } from '../storage/keys';

/**
 * WikiBrain Semantic Index - Sovereign Knowledge Engine
 * Made with Moe Abdelaziz
 */

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

// RULE 1: Strict Schemas
export const SearchFilterSchema = z.object({
  type: z.enum(['agent', 'skill', 'mcp']).optional(),
  includePrivate: z.boolean().default(false),
});

export const AgentManifestSchema = z.object({
  did: z.string(),
  identity_layer: z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    description: z.string().optional(),
    visibility: z.enum(['public', 'private', 'sovereign']).default('public'),
  }).optional(),
  capabilities: z.array(z.string()).optional(),
  skills: z.array(z.any()).optional(),
});

export type SearchFilter = z.infer<typeof SearchFilterSchema>;

export interface SemanticResult {
  id: string;
  type: string;
  name: string;
  score: number;
  snippet?: string;
  relatedIds?: string[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const ext = await getExtractor();
  const output = await ext(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Indexes an agent while respecting privacy (RULE 0)
 */
export async function indexAgent(manifest: any): Promise<void> {
  const validManifest = AgentManifestSchema.parse(manifest);
  const id = validManifest.identity_layer?.name || validManifest.did;
  
  const visibility = validManifest.identity_layer?.visibility || 'public';
  
  const textToIndex = `
    Agent Name: ${validManifest.identity_layer?.name || ''}
    Role: ${validManifest.identity_layer?.role || ''}
    Description: ${validManifest.identity_layer?.description || ''}
    Capabilities: ${(validManifest.capabilities || []).join(', ')}
  `.trim();

  const embedding = await generateEmbedding(textToIndex);

  const entry = {
    id,
    type: 'agent',
    visibility,
    name: validManifest.identity_layer?.name || id,
    snippet: validManifest.identity_layer?.description || '',
    embedding,
    updatedAt: Date.now()
  };

  await kv.set(`wikibrain:index:${id}`, entry);

  const allKeys = await kv.lrange<string>('wikibrain:index_keys', 0, -1);
  if (!allKeys.includes(id)) {
    await kv.lpush('wikibrain:index_keys', id);
  }
}

/**
 * Sovereign Search - Filters results based on visibility and trust
 */
export async function search(query: string, topK: number, filterInput?: SearchFilter): Promise<{ results: SemanticResult[], queryEmbedding: number[], searchTimeMs: number }> {
  const start = Date.now();
  const filter = SearchFilterSchema.parse(filterInput || {});
  const queryEmbedding = await generateEmbedding(query);

  const allKeys = await kv.lrange<string>('wikibrain:index_keys', 0, -1);
  const results: SemanticResult[] = [];

  for (const key of allKeys) {
    const existing = await kv.get<any>(`wikibrain:index:${key}`);
    if (existing && existing.embedding) {
      // RULE 0: Privacy Check
      if (existing.visibility === 'private' && !filter.includePrivate) continue;
      if (filter.type && existing.type !== filter.type) continue;

      const score = cosineSimilarity(queryEmbedding, existing.embedding);
      if (score > 0.3) {
        results.push({
          id: existing.id,
          type: existing.type,
          name: existing.name,
          score,
          snippet: existing.snippet
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  return {
    results: results.slice(0, topK),
    queryEmbedding,
    searchTimeMs: Date.now() - start
  };
}

// Made with Moe Abdelaziz
