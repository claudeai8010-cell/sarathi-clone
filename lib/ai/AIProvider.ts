import 'server-only';

import type { AIExtractionDTO } from '@/dto/AIExtractionDTO';

// ============================================================
// AIProvider Interface
// All AI backends implement this contract.
// Swapping providers (OpenAI → Gemini → Anthropic) requires
// only a new implementation of this interface.
// ============================================================

export interface AIProvider {
  readonly name: string;

  /**
   * Parse unstructured driver input (voice transcript, SMS, typed message)
   * into a structured trip extraction.
   */
  extractTripData(rawInput: string): Promise<AIExtractionDTO>;
}
