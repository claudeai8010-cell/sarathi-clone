import 'server-only';

import { FIELD_CONFIDENCE_WEIGHTS } from '@/config/confidence';

import type { AIProvider } from './AIProvider';
import type { AIExtractionDTO } from '@/dto/AIExtractionDTO';
import type { ParsedTripDTO } from '@/dto/ParsedTripDTO';


// ============================================================
// MockAIProvider
// Deterministic regex-based parser for testing.
// Parses common Indian logistics shorthand.
// ============================================================

const ROUTE_PATTERN =
  /(?:from\s+)?([A-Za-z\s]+?)\s+(?:to|→|->)\s+([A-Za-z\s]+?)(?:\s*[,.]|$)/i;

const PAYLOAD_PATTERN =
  /(\d+(?:\.\d+)?)\s*(?:kg|tonne[s]?|ton[s]?|MT|T)\b/i;

const REVENUE_PATTERN =
  /(?:₹|rs\.?|inr\.?)\s*(\d[\d,]*(?:\.\d{1,2})?)|(\d[\d,]*(?:\.\d{1,2})?)\s*(?:rupees?|\/-)/ ;

function parsePayloadKg(raw: string): number | null {
  const match = PAYLOAD_PATTERN.exec(raw);
  if (!match || !match[1]) return null;
  const value = parseFloat(match[1].replace(',', ''));
  const unit = raw.slice(match.index + match[1].length).trim().toLowerCase();
  if (unit.startsWith('tonne') || unit.startsWith('ton') || unit.startsWith('mt') || unit === 't') {
    return value * 1000;
  }
  return value;
}

function parseRevenue(raw: string): number | null {
  const match = REVENUE_PATTERN.exec(raw);
  if (!match) return null;
  const captured = match[1] ?? match[2];
  if (!captured) return null;
  return parseFloat(captured.replace(/,/g, ''));
}

function computeConfidence(fields: {
  pickupLocation: boolean;
  dropLocation: boolean;
  payloadKg: boolean;
  grossRevenue: boolean;
}): number {
  let score = 0;
  if (fields.pickupLocation) score += FIELD_CONFIDENCE_WEIGHTS.pickupLocation;
  if (fields.dropLocation) score += FIELD_CONFIDENCE_WEIGHTS.dropLocation;
  if (fields.payloadKg) score += FIELD_CONFIDENCE_WEIGHTS.payloadKg;
  if (fields.grossRevenue) score += FIELD_CONFIDENCE_WEIGHTS.grossRevenue;
  return Math.round(score * 100);
}

export class MockAIProvider implements AIProvider {
  readonly name = 'mock';

  extractTripData(rawInput: string): Promise<AIExtractionDTO> {
    const start = Date.now();
    const normalized = rawInput.trim();

    const routeMatch = ROUTE_PATTERN.exec(normalized);
    const pickupLocation = routeMatch?.[1]?.trim() ?? '';
    const dropLocation = routeMatch?.[2]?.trim() ?? '';
    const payloadKg = parsePayloadKg(normalized) ?? 0;
    const grossRevenue = parseRevenue(normalized) ?? 0;

    const found = {
      pickupLocation: pickupLocation.length > 0,
      dropLocation: dropLocation.length > 0,
      payloadKg: payloadKg > 0,
      grossRevenue: grossRevenue > 0,
    };

    const missingFields = Object.entries(found)
      .filter(([, v]) => !v)
      .map(([k]) => k);

    const warnings: string[] = [];
    if (normalized.length < 10) warnings.push('Input is very short — low extraction quality expected');
    if (payloadKg > 25_000) warnings.push('Payload exceeds typical truck capacity (25 000 kg)');

    const parsed: ParsedTripDTO = {
      rawInput: normalized,
      pickupLocation,
      dropLocation,
      payloadKg,
      grossRevenue,
      notes: normalized,
      confidence: computeConfidence(found),
      missingFields,
      warnings,
    };

    return Promise.resolve({
      rawInput: normalized,
      parsed,
      provider: this.name,
      processingTimeMs: Date.now() - start,
      tokensUsed: null,
      modelVersion: 'mock-v1',
    });
  }
}
