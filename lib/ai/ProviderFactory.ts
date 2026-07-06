import 'server-only';

import { MockAIProvider } from './MockAIProvider';

import type { AIProvider } from './AIProvider';

// ============================================================
// ProviderFactory
// Returns the correct AIProvider based on environment config.
// Business logic (AIService) never imports a concrete provider.
// To add OpenAI/Gemini/Anthropic: add a branch here only.
// ============================================================

export type AIProviderName = 'mock' | 'openai' | 'gemini' | 'anthropic';

export interface AIProviderConfig {
  provider: AIProviderName;
  apiKey?: string;
}

function resolveConfig(): AIProviderConfig {
  const name = process.env['AI_PROVIDER'] as AIProviderName | undefined;
  const apiKey = process.env['AI_API_KEY'];
  return { provider: name ?? 'mock', apiKey };
}

export function createAIProvider(config?: AIProviderConfig): AIProvider {
  const resolved = config ?? resolveConfig();

  switch (resolved.provider) {
    case 'mock':
      return new MockAIProvider();

    case 'openai':
    case 'gemini':
    case 'anthropic':
      // Future: instantiate the real provider here when API keys are available.
      // e.g. return new OpenAIProvider(resolved.apiKey!)
      // Fall through to mock during Phase 3 — no production API keys yet.
      return new MockAIProvider();

    default: {
      const _exhaustive: never = resolved.provider;
      void _exhaustive;
      return new MockAIProvider();
    }
  }
}
