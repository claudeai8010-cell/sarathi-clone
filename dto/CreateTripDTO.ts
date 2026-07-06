import 'server-only';

import type { ParsedTripDTO } from './ParsedTripDTO';

// ============================================================
// CreateTripDTO
// Structured input handed to TripService.createTrip().
// Combines identity (who, which trip) with AI-parsed content.
// ============================================================

export interface CreateTripDTO {
  readonly tripId: string;
  readonly userId: string;
  readonly parsed: ParsedTripDTO;
}
