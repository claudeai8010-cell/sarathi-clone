import 'server-only';

// ============================================================
// AI CONFIDENCE THRESHOLDS
// Controls when AI output is accepted, clarified, or rejected.
// ============================================================

export const CONFIDENCE_THRESHOLDS = {
  // Auto-accept parsed trip without user confirmation
  acceptance: 70,

  // Ask user to confirm/correct before proceeding
  clarification: 40,

  // Reject outright — too uncertain to use
  minimumForProcessing: 20,
} as const;

export type ConfidenceDecision = 'accept' | 'clarify' | 'reject';

export function evaluateConfidence(score: number): ConfidenceDecision {
  if (score >= CONFIDENCE_THRESHOLDS.acceptance) return 'accept';
  if (score >= CONFIDENCE_THRESHOLDS.clarification) return 'clarify';
  return 'reject';
}

// Field-level weights used when computing aggregate confidence
export const FIELD_CONFIDENCE_WEIGHTS = {
  pickupLocation: 0.25,
  dropLocation: 0.25,
  payloadKg: 0.20,
  grossRevenue: 0.30,
} as const;
