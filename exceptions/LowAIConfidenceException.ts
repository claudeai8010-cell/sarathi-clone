import 'server-only';

import { type ConfidenceDecision } from '@/config/confidence';

import { DomainException } from './DomainException';

export class LowAIConfidenceException extends DomainException {
  constructor(
    public readonly score: number,
    public readonly threshold: number,
    public readonly decision: ConfidenceDecision,
    public readonly missingFields: string[],
  ) {
    super(
      `AI confidence score ${score.toFixed(1)} is below threshold ${threshold} (decision: ${decision})`,
      'LOW_AI_CONFIDENCE',
      422,
    );
    this.name = 'LowAIConfidenceException';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
