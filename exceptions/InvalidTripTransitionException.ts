import 'server-only';

import { type TripStatus } from '@/types/database';

import { DomainException } from './DomainException';

export class InvalidTripTransitionException extends DomainException {
  constructor(
    public readonly from: TripStatus,
    public readonly to: TripStatus,
  ) {
    super(
      `Invalid trip status transition: '${from}' → '${to}'`,
      'INVALID_TRIP_TRANSITION',
      422,
    );
    this.name = 'InvalidTripTransitionException';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
