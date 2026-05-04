import fs from 'fs';
import path from 'path';
import { GroqProvider } from '../packages/aix-core/src/llm-provider';
import { kv } from '../packages/aix-core/src/storage/adapter';
import { SemanticIndex } from '../packages/aix-core/src/wikibrain/SemanticIndex';

// Manual .env loader
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

async function main() {
  console.log('🚀 Starting Manual Sovereign Meta-Loop...');
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ Missing GROQ_API_KEY');
    return;
  }

  const llm = new GroqProvider(apiKey);
  const semanticIndex = new SemanticIndex();

  const prompt = `
    You are the AIX Sovereign Architect.
    Analyze the current state of the AIX-Format project.
    
    Current Progress:
    - TrustChain stabilized with in-memory fallback.
    - GitHub Actions for auto-evolution implemented.
    - Langfuse tracing integrated.
    - Semantic Memory (Nomic) active.
    
    Task:
    Extract one "Sovereign Lesson" about building self-evolving systems.
    Identify one pattern violation in the current code (e.g. inconsistency in naming or structure).
    Suggest a name and purpose for a new agent pet.
    
    Format your response as a JSON object:
    {
      "lesson": "...",
      "violation": "...",
      "newPet": { "name": "...", "purpose": "..." }
    }
  `;

  console.log('🧠 Thinking...');
  const response = await llm.complete(prompt);
  console.log('✨ Analysis Complete:', response);

  try {
    const data = JSON.parse(response.replace(/```json|```/g, '').trim());
    
    // Save to Redis
    await kv.set('evolution:latest_lesson', data);
    
    // Index in WikiBrain
    await semanticIndex.index(
      'lesson-' + Date.now(),
      'wisdom',
      `Sovereign Lesson: ${data.lesson}\nViolation Found: ${data.violation}`,
      { name: 'Meta-Loop Wisdom', visibility: 'public' }
    );

    console.log('✅ Wisdom grafted successfully!');
  } catch (e) {
    console.error('❌ Failed to parse or save wisdom:', e);
    console.log('Raw response was:', response);
  }
}

main().catch(console.error);
