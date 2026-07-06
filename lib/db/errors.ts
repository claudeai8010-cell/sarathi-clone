import 'server-only';

// ============================================================
// BASE ERROR
// ============================================================

export class DbError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'DbError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ============================================================
// TYPED ERROR CLASSES
// ============================================================

export class DuplicateKeyError extends DbError {
  constructor(
    public readonly field: string,
    public readonly value: unknown,
    originalError?: unknown,
  ) {
    super(`Duplicate value for field: ${field}`, 'DUPLICATE_KEY', originalError);
    this.name = 'DuplicateKeyError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationDbError extends DbError {
  constructor(
    public readonly errors: Record<string, string>,
    originalError?: unknown,
  ) {
    super('Database validation failed', 'VALIDATION_ERROR', originalError);
    this.name = 'ValidationDbError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends DbError {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`, 'NOT_FOUND');
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConnectionError extends DbError {
  constructor(message: string, originalError?: unknown) {
    super(`Database connection error: ${message}`, 'CONNECTION_ERROR', originalError);
    this.name = 'ConnectionError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnknownDbError extends DbError {
  constructor(originalError: unknown) {
    super('An unknown database error occurred', 'UNKNOWN_ERROR', originalError);
    this.name = 'UnknownDbError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ============================================================
// MONGOOSE ERROR MAPPING
// ============================================================

const MONGODB_DUPLICATE_KEY_CODE = 11000;

interface MongooseValidationError {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}

interface MongoError {
  code: number;
  keyValue?: Record<string, unknown>;
}

function isMongooseValidationError(err: unknown): err is MongooseValidationError {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as MongooseValidationError).name === 'ValidationError' &&
    typeof (err as MongooseValidationError).errors === 'object'
  );
}

function isMongoError(err: unknown): err is MongoError {
  return (
    typeof err === 'object' &&
    err !== null &&
    typeof (err as MongoError).code === 'number'
  );
}

export function mapMongooseError(err: unknown): DbError {
  if (err instanceof DbError) return err;

  if (isMongoError(err) && err.code === MONGODB_DUPLICATE_KEY_CODE) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'unknown';
    const value = err.keyValue?.[field];
    return new DuplicateKeyError(field, value, err);
  }

  if (isMongooseValidationError(err)) {
    const errors: Record<string, string> = {};
    for (const [key, val] of Object.entries(err.errors)) {
      errors[key] = val.message;
    }
    return new ValidationDbError(errors, err);
  }

  if (err instanceof Error && err.message.toLowerCase().includes('connect')) {
    return new ConnectionError(err.message, err);
  }

  return new UnknownDbError(err);
}
