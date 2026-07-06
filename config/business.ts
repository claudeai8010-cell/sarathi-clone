import 'server-only';

// ============================================================
// BUSINESS CONFIGURATION
// All domain thresholds and defaults live here.
// Never scatter magic numbers across services.
// ============================================================

export const TRIP_SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  poor: 0,
} as const;

export type TripScoreLabel = 'excellent' | 'good' | 'fair' | 'poor';

export function getTripScoreLabel(score: number): TripScoreLabel {
  if (score >= TRIP_SCORE_THRESHOLDS.excellent) return 'excellent';
  if (score >= TRIP_SCORE_THRESHOLDS.good) return 'good';
  if (score >= TRIP_SCORE_THRESHOLDS.fair) return 'fair';
  return 'poor';
}

export const PROFIT_THRESHOLDS_INR = {
  highProfit: 8000,
  mediumProfit: 3000,
  breakEven: 0,
} as const;

export const BROKER_DEFAULTS = {
  averagePaymentDelayDays: 7,
  defaultRating: 3,
  maxPaymentDelayDays: 90,
  defaultBrokerFeePct: 0,
} as const;

export const TRIP_CONSTRAINTS = {
  maxPayloadKg: 25_000,
  minPayloadKg: 0,
  minRevenue: 0,
  minConfidenceForAutoAccept: 85,
} as const;

export const EXPENSE_CONSTRAINTS = {
  maxReceiptUrlLength: 2048,
  maxNotesLength: 500,
} as const;

export const ANALYTICS_DEFAULTS = {
  defaultPageSize: 50,
  maxAggregationDays: 365,
} as const;
