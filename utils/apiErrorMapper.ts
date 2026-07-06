import 'server-only';

import { DomainException } from '@/exceptions/DomainException';
import { InsufficientDriverDataException } from '@/exceptions/InsufficientDriverDataException';
import { InvalidTripTransitionException } from '@/exceptions/InvalidTripTransitionException';
import { LowAIConfidenceException } from '@/exceptions/LowAIConfidenceException';
import { RouteCalculationException } from '@/exceptions/RouteCalculationException';
import {
  ConnectionError,
  DuplicateKeyError,
  NotFoundError,
  ValidationDbError,
} from '@/lib/db/errors';
import { logger } from '@/lib/logger';

import type { ApiError } from '@/types/api';

// ============================================================
// API Error Mapper
// Single authority for exception → HTTP status + ApiError shape.
// Route handlers MUST NOT duplicate this logic.
// All mappings follow the Phase 4A contract.
// ============================================================

export interface MappedError {
  status: number;
  apiError: ApiError;
  /** True only for LowAIConfidenceException (202 Accepted) */
  requiresClarification?: boolean;
}

export function mapErrorToMappedError(err: unknown): MappedError {
  // ── Domain exceptions — checked from most specific to least ─

  if (err instanceof InvalidTripTransitionException) {
    return {
      status: 409,
      apiError: {
        code: err.code,
        message: err.message,
        details: { from: err.from, to: err.to },
      },
    };
  }

  if (err instanceof LowAIConfidenceException) {
    return {
      status: 202,
      requiresClarification: true,
      apiError: {
        code: err.code,
        message: err.message,
        details: {
          score: err.score,
          threshold: err.threshold,
          missingFields: err.missingFields,
          requiresClarification: true,
        },
      },
    };
  }

  if (err instanceof RouteCalculationException) {
    return {
      status: 502,
      apiError: {
        code: err.code,
        message: err.message,
        details: { origin: err.origin, destination: err.destination },
      },
    };
  }

  if (err instanceof InsufficientDriverDataException) {
    return {
      status: 400,
      apiError: {
        code: err.code,
        message: err.message,
        details: { missingFields: err.missingFields },
      },
    };
  }

  // Catch remaining DomainExceptions (e.g. TRIP_OWNERSHIP_VIOLATION)
  if (err instanceof DomainException) {
    return {
      status: err.statusHint,
      apiError: { code: err.code, message: err.message },
    };
  }

  // ── Database errors ────────────────────────────────────────

  if (err instanceof NotFoundError) {
    return {
      status: 404,
      apiError: { code: err.code, message: err.message },
    };
  }

  if (err instanceof DuplicateKeyError) {
    return {
      status: 409,
      apiError: {
        code: err.code,
        message: err.message,
        details: { field: err.field },
      },
    };
  }

  if (err instanceof ValidationDbError) {
    return {
      status: 400,
      apiError: {
        code: err.code,
        message: err.message,
        details: { errors: err.errors },
      },
    };
  }

  if (err instanceof ConnectionError) {
    return {
      status: 503,
      apiError: {
        code: 'CONNECTION_ERROR',
        message: 'Service temporarily unavailable',
      },
    };
  }

  // ── Unhandled ──────────────────────────────────────────────

  logger.error('Unhandled API error', {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  return {
    status: 500,
    apiError: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
}
