import 'server-only';

import { RouteCalculationException } from '@/exceptions/RouteCalculationException';

import type { ILogger } from '@/lib/logger';

// ============================================================
// MapsService
// Deterministic route simulation. Phase 3 uses no external API.
// Known city pairs return precomputed values.
// Unknown pairs generate deterministic results via string hashing.
// Never hardcode a single distance inline — all data is in KNOWN_ROUTES.
// ============================================================

export interface RouteResult {
  readonly distanceKm: number;
  readonly durationMinutes: number;
  readonly estimatedToll: number;
  readonly confidence: number;
}

interface RouteData {
  distanceKm: number;
  durationMinutes: number;
  estimatedToll: number;
}

// 20 major Indian city-pair routes (bidirectional — stored under sorted key)
const KNOWN_ROUTES: Readonly<Record<string, RouteData>> = {
  'ahmedabad:mumbai':    { distanceKm: 524,  durationMinutes: 480, estimatedToll: 780 },
  'ahmedabad:surat':     { distanceKm: 265,  durationMinutes: 270, estimatedToll: 400 },
  'bangalore:chennai':   { distanceKm: 346,  durationMinutes: 360, estimatedToll: 520 },
  'bangalore:hyderabad': { distanceKm: 569,  durationMinutes: 560, estimatedToll: 840 },
  'bangalore:mysore':    { distanceKm: 144,  durationMinutes: 160, estimatedToll: 220 },
  'bangalore:pune':      { distanceKm: 837,  durationMinutes: 840, estimatedToll: 1250 },
  'bhubaneswar:kolkata': { distanceKm: 441,  durationMinutes: 420, estimatedToll: 660 },
  'chandigarh:delhi':    { distanceKm: 247,  durationMinutes: 260, estimatedToll: 380 },
  'chennai:hyderabad':   { distanceKm: 627,  durationMinutes: 600, estimatedToll: 920 },
  'delhi:jaipur':        { distanceKm: 281,  durationMinutes: 300, estimatedToll: 450 },
  'agra:delhi':          { distanceKm: 233,  durationMinutes: 240, estimatedToll: 350 },
  'delhi:lucknow':       { distanceKm: 551,  durationMinutes: 540, estimatedToll: 800 },
  'amritsar:delhi':      { distanceKm: 452,  durationMinutes: 450, estimatedToll: 680 },
  'delhi:mumbai':        { distanceKm: 1414, durationMinutes: 1200, estimatedToll: 2200 },
  'hyderabad:pune':      { distanceKm: 559,  durationMinutes: 540, estimatedToll: 820 },
  'kolkata:patna':       { distanceKm: 585,  durationMinutes: 580, estimatedToll: 870 },
  'mumbai:nashik':       { distanceKm: 167,  durationMinutes: 180, estimatedToll: 320 },
  'mumbai:pune':         { distanceKm: 149,  durationMinutes: 160, estimatedToll: 280 },
  'mumbai:surat':        { distanceKm: 284,  durationMinutes: 300, estimatedToll: 420 },
  'nashik:pune':         { distanceKm: 212,  durationMinutes: 210, estimatedToll: 320 },
} as const;

// Average truck speed on Indian national highways (km/h)
const AVG_SPEED_KMH = 60;
// Average toll per km on NHs (INR/km)
const TOLL_RATE_INR_PER_KM = 1.8;
// Simulated route confidence (lower than known routes)
const SIMULATED_CONFIDENCE = 0.6;

function normalizeCity(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, ' ');
}

function routeKey(a: string, b: string): string {
  return [normalizeCity(a), normalizeCity(b)].sort().join(':');
}

/**
 * Deterministic hash of a string → stable integer.
 * djb2 variant, unsigned 32-bit.
 */
function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

function simulateRoute(origin: string, destination: string): RouteResult {
  const key = routeKey(origin, destination);
  const hash = djb2Hash(key);
  const distanceKm = 100 + (hash % 1900);
  const durationMinutes = Math.round((distanceKm / AVG_SPEED_KMH) * 60);
  const estimatedToll = Math.round(distanceKm * TOLL_RATE_INR_PER_KM);
  return { distanceKm, durationMinutes, estimatedToll, confidence: SIMULATED_CONFIDENCE };
}

export class MapsService {
  constructor(private readonly log: ILogger) {}

  calculateRoute(origin: string, destination: string): RouteResult {
    const start = Date.now();

    if (!origin.trim() || !destination.trim()) {
      throw new RouteCalculationException(origin, destination, 'location cannot be empty');
    }

    if (normalizeCity(origin) === normalizeCity(destination)) {
      throw new RouteCalculationException(origin, destination, 'origin and destination are the same');
    }

    const key = routeKey(origin, destination);
    const known = KNOWN_ROUTES[key];

    let result: RouteResult;
    if (known) {
      result = { ...known, confidence: 1.0 };
      this.log.debug('MapsService.calculateRoute: known route', { origin, destination, key });
    } else {
      result = simulateRoute(origin, destination);
      this.log.info('MapsService.calculateRoute: simulated route', {
        origin,
        destination,
        distanceKm: result.distanceKm,
        confidence: result.confidence,
      });
    }

    this.log.debug('MapsService.calculateRoute: complete', {
      origin,
      destination,
      distanceKm: result.distanceKm,
      elapsedMs: Date.now() - start,
    });

    return result;
  }
}
