import 'server-only';

import { InvalidTripTransitionException } from '@/exceptions/InvalidTripTransitionException';
import { TripStatus } from '@/types/database';

import type { ILogger } from '@/lib/logger';

// ============================================================
// TripLifecycleService
// Single responsibility: validate and enforce trip status
// transitions. Nothing else belongs here.
// ============================================================

const ALLOWED_NEXT_STATUS: Readonly<Record<TripStatus, TripStatus | null>> = {
  [TripStatus.New]: TripStatus.Accepted,
  [TripStatus.Accepted]: TripStatus.Loaded,
  [TripStatus.Loaded]: TripStatus.InTransit,
  [TripStatus.InTransit]: TripStatus.Delivered,
  [TripStatus.Delivered]: TripStatus.Paid,
  [TripStatus.Paid]: null,
};

export class TripLifecycleService {
  constructor(private readonly log: ILogger) {}

  /**
   * Validates that transitioning from `current` to `next` is allowed.
   * Throws InvalidTripTransitionException on any violation.
   */
  validateTransition(current: TripStatus, next: TripStatus): void {
    const allowed = ALLOWED_NEXT_STATUS[current];

    if (allowed === null) {
      this.log.warn('TripLifecycleService.validateTransition: trip is in terminal state', {
        current,
        requested: next,
      });
      throw new InvalidTripTransitionException(current, next);
    }

    if (allowed !== next) {
      this.log.warn('TripLifecycleService.validateTransition: invalid transition', {
        current,
        requested: next,
        allowed,
      });
      throw new InvalidTripTransitionException(current, next);
    }

    this.log.debug('TripLifecycleService.validateTransition: transition valid', {
      current,
      next,
    });
  }

  /**
   * Returns the next allowed status, or null if the trip is terminal.
   */
  nextAllowedStatus(current: TripStatus): TripStatus | null {
    return ALLOWED_NEXT_STATUS[current];
  }

  /**
   * Returns true if the trip status is terminal (Paid).
   */
  isTerminal(status: TripStatus): boolean {
    return ALLOWED_NEXT_STATUS[status] === null;
  }
}
