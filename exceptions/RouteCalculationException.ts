import 'server-only';

import { DomainException } from './DomainException';

export class RouteCalculationException extends DomainException {
  constructor(
    public readonly origin: string,
    public readonly destination: string,
    reason?: string,
  ) {
    super(
      `Cannot calculate route from '${origin}' to '${destination}'${reason ? `: ${reason}` : ''}`,
      'ROUTE_CALCULATION_FAILED',
      422,
    );
    this.name = 'RouteCalculationException';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
