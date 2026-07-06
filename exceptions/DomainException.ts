import 'server-only';

// ============================================================
// DOMAIN EXCEPTION HIERARCHY
// All domain exceptions extend DomainException.
// Never throw raw Error from service layer.
// ============================================================

export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusHint: number = 422,
  ) {
    super(message);
    this.name = 'DomainException';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
