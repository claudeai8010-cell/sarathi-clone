import 'server-only';

import { evaluateConfidence, CONFIDENCE_THRESHOLDS } from '@/config/confidence';
import { LowAIConfidenceException } from '@/exceptions/LowAIConfidenceException';

import type { AIExtractionDTO } from '@/dto/AIExtractionDTO';
import type { AIProvider } from '@/lib/ai/AIProvider';
import type { ILogger } from '@/lib/logger';

// ============================================================
// AIService
// Single responsibility: convert unstructured logistics text
// into structured ParsedTripDTO via the injected AIProvider.
// Never calls OpenAI/Gemini directly — uses the provider contract.
// ============================================================

export class AIService {
  constructor(
    private readonly provider: AIProvider,
    private readonly log: ILogger,
  ) {}

  /**
   * Extract structured trip data from raw driver input.
   * Throws LowAIConfidenceException if confidence is below the
   * minimum-for-processing threshold.
   */
  async extractTripData(rawInput: string): Promise<AIExtractionDTO> {
    const start = Date.now();

    this.log.info('AIService.extractTripData: start', {
      provider: this.provider.name,
      inputLength: rawInput.length,
    });

    if (!rawInput.trim()) {
      throw new LowAIConfidenceException(
        0,
        CONFIDENCE_THRESHOLDS.minimumForProcessing,
        'reject',
        ['pickupLocation', 'dropLocation', 'payloadKg', 'grossRevenue'],
      );
    }

    let result: AIExtractionDTO;
    try {
      result = await this.provider.extractTripData(rawInput);
    } catch (err) {
      this.log.error('AIService.extractTripData: provider error', {
        provider: this.provider.name,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }

    const decision = evaluateConfidence(result.parsed.confidence);

    this.log.info('AIService.extractTripData: complete', {
      provider: this.provider.name,
      confidence: result.parsed.confidence,
      decision,
      missingFields: result.parsed.missingFields,
      elapsedMs: Date.now() - start,
    });

    if (decision === 'reject') {
      throw new LowAIConfidenceException(
        result.parsed.confidence,
        CONFIDENCE_THRESHOLDS.minimumForProcessing,
        decision,
        [...result.parsed.missingFields],
      );
    }

    return result;
  }

  /**
   * Extract without throwing on low confidence — useful when
   * the caller wants to display a clarification UI.
   */
  async extractTripDataLenient(rawInput: string): Promise<AIExtractionDTO> {
    const start = Date.now();
    this.log.debug('AIService.extractTripDataLenient: start', { inputLength: rawInput.length });

    const result = await this.provider.extractTripData(rawInput.trim());
    const decision = evaluateConfidence(result.parsed.confidence);

    this.log.info('AIService.extractTripDataLenient: complete', {
      confidence: result.parsed.confidence,
      decision,
      elapsedMs: Date.now() - start,
    });

    return result;
  }

  get providerName(): string {
    return this.provider.name;
  }
}
