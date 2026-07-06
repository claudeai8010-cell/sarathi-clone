import 'server-only';

import type { TripScoreLabel } from '@/config/business';
import type { SyncStatus, TripStatus } from '@/types/database';

// ============================================================
// TripSummaryDTO
// Returned by TripService after a trip is created or fetched.
// Never exposes raw Mongoose documents.
// ============================================================

export interface TripSummaryDTO {
  readonly tripId: string;
  readonly mongoId: string;
  readonly status: TripStatus;
  readonly pickupLocation: string;
  readonly dropLocation: string;
  readonly payloadKg: number;
  readonly grossRevenue: number;
  readonly estimatedFuelCost: number;
  readonly estimatedToll: number;
  readonly netProfit: number;
  readonly confidenceScore: number;
  readonly tripScore: number;
  readonly tripScoreLabel: TripScoreLabel;
  readonly roi: number;
  readonly distanceKm: number;
  readonly estimatedDurationMinutes: number;
  readonly syncStatus: SyncStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
