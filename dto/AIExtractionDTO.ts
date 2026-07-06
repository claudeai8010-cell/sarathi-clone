import 'server-only';

import type { ParsedTripDTO } from './ParsedTripDTO';

// ============================================================
// AIExtractionDTO
// Full envelope returned by AIService — includes telemetry
// alongside the parsed trip so callers can log/audit AI usage.
// ============================================================

export interface AIExtractionDTO {
  readonly rawInput: string;
  readonly parsed: ParsedTripDTO;
  readonly provider: string;
  readonly processingTimeMs: number;
  readonly tokensUsed: number | null;
  readonly modelVersion: string | null;
}

// ============================================================
// AnalyticsDTO
// ============================================================

export interface DailyTotalsDTO {
  readonly date: string;
  readonly tripCount: number;
  readonly totalRevenue: number;
  readonly totalProfit: number;
  readonly totalExpenses: number;
}

export interface PeriodSummaryDTO {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly tripCount: number;
  readonly totalRevenue: number;
  readonly totalProfit: number;
  readonly totalExpenses: number;
  readonly averageTripProfit: number;
  readonly mostProfitableTripId: string | null;
}

export interface DriverAnalyticsDTO {
  readonly userId: string;
  readonly daily: DailyTotalsDTO[];
  readonly weekly: PeriodSummaryDTO;
  readonly monthly: PeriodSummaryDTO;
}
