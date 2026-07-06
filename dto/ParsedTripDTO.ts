import 'server-only';

// ============================================================
// ParsedTripDTO
// Output of AI extraction — fields the AI was able to extract
// from unstructured driver input.
// ============================================================

export interface ParsedTripDTO {
  readonly rawInput: string;
  readonly pickupLocation: string;
  readonly dropLocation: string;
  readonly payloadKg: number;
  readonly grossRevenue: number;
  readonly notes: string;
  readonly confidence: number;
  readonly missingFields: readonly string[];
  readonly warnings: readonly string[];
}

// Fields the AI must populate for a trip to be processable
export const REQUIRED_TRIP_FIELDS: ReadonlyArray<keyof Omit<ParsedTripDTO, 'rawInput' | 'notes' | 'confidence' | 'missingFields' | 'warnings'>> = [
  'pickupLocation',
  'dropLocation',
  'payloadKg',
  'grossRevenue',
] as const;
