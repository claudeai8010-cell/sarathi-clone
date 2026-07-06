import 'server-only';

import { DomainException } from './DomainException';

export class InsufficientDriverDataException extends DomainException {
  constructor(
    public readonly driverUserId: string,
    public readonly missingFields: string[],
  ) {
    super(
      `Driver '${driverUserId}' is missing required fields for profitability calculation: ${missingFields.join(', ')}`,
      'INSUFFICIENT_DRIVER_DATA',
      422,
    );
    this.name = 'InsufficientDriverDataException';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
