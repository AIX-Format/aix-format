import { LLMProvider } from './types';
import { CircuitBreaker } from '../infra';

/**
 * Groq Provider - Fast as Light
 * Made with Moe Abdelaziz
 */
export class GroqProvider implements LLMProvider {
  private cb: CircuitBreaker;
  model: string;

  constructor(
    private apiKey: string,
    model = 'llama-3.3-70b-versatile'
  ) {
    this.model = model;
    this.cb = new CircuitBreaker({ name: 'Groq' });
  }

  async complete(prompt: string, stopTokens?: string[]): Promise<string> {
    return this.cb.execute(async () => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          stop: stopTokens,
          max_tokens: 2048,
          temperature: 0.7
        })
      });

      if (!res.ok) throw new Error(`Groq API Error: ${res.status}`);
      const data = await res.json() as any;
      return data.choices[0]?.message?.content ?? '';
    });
  }
}
