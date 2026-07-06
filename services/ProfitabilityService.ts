import 'server-only';

import { TRIP_SCORE_THRESHOLDS, getTripScoreLabel } from '@/config/business';
import { FUEL_PRICES_INR } from '@/config/fuelPrices';

import type { TripScoreLabel } from '@/config/business';
import type { ILogger } from '@/lib/logger';
import type { FuelType } from '@/types/database';

// ============================================================
// ProfitabilityService
// Pure financial calculations. No repository access.
// No routing. No AI. Read config — never hardcode numbers.
// ============================================================

export interface ProfitabilityInput {
  readonly distanceKm: number;
  readonly fuelType: FuelType;
  readonly baseMileage: number;
  readonly grossRevenue: number;
  readonly estimatedToll: number;
  readonly brokerFeePct?: number;
}

export interface ProfitabilityResult {
  readonly fuelCost: number;
  readonly tollCost: number;
  readonly brokerFee: number;
  readonly totalCost: number;
  readonly netProfit: number;
  readonly tripScore: number;
  readonly tripScoreLabel: TripScoreLabel;
  readonly roi: number;
}

export class ProfitabilityService {
  constructor(private readonly log: ILogger) {}

  calculateFuelCost(distanceKm: number, fuelType: FuelType, baseMileage: number): number {
    if (baseMileage <= 0) return 0;
    const pricePerLitre = FUEL_PRICES_INR[fuelType];
    const litresConsumed = distanceKm / baseMileage;
    return Math.round(litresConsumed * pricePerLitre * 100) / 100;
  }

  calculateBrokerFee(grossRevenue: number, brokerFeePct: number): number {
    return Math.round((grossRevenue * brokerFeePct) / 100 * 100) / 100;
  }

  /**
   * Trip Score: how efficient this trip is as a percentage of gross revenue
   * retained as profit. Clamped to [0, 100].
   */
  calculateTripScore(netProfit: number, grossRevenue: number): number {
    if (grossRevenue <= 0) return 0;
    const pct = (netProfit / grossRevenue) * 100;
    return Math.round(Math.max(0, Math.min(100, pct)));
  }

  /**
   * ROI: return on the operating cost invested.
   * roi = (netProfit / totalCost) * 100
   */
  calculateROI(netProfit: number, totalCost: number): number {
    if (totalCost <= 0) return 0;
    return Math.round((netProfit / totalCost) * 100 * 100) / 100;
  }

  /**
   * Master calculation — runs all sub-calculations from a single input.
   */
  calculateAll(input: ProfitabilityInput): ProfitabilityResult {
    const start = Date.now();

    const fuelCost = this.calculateFuelCost(
      input.distanceKm,
      input.fuelType,
      input.baseMileage,
    );
    const tollCost = Math.round(input.estimatedToll * 100) / 100;
    const brokerFee = this.calculateBrokerFee(
      input.grossRevenue,
      input.brokerFeePct ?? 0,
    );
    const totalCost = fuelCost + tollCost + brokerFee;
    const netProfit = Math.round((input.grossRevenue - totalCost) * 100) / 100;
    const tripScore = this.calculateTripScore(netProfit, input.grossRevenue);
    const tripScoreLabel = getTripScoreLabel(tripScore);
    const roi = this.calculateROI(netProfit, totalCost);

    this.log.debug('ProfitabilityService.calculateAll', {
      distanceKm: input.distanceKm,
      fuelCost,
      tollCost,
      brokerFee,
      netProfit,
      tripScore,
      elapsedMs: Date.now() - start,
    });

    return { fuelCost, tollCost, brokerFee, totalCost, netProfit, tripScore, tripScoreLabel, roi };
  }

  /**
   * Expose thresholds so callers can display score labels without re-importing config.
   */
  getScoreThresholds(): typeof TRIP_SCORE_THRESHOLDS {
    return TRIP_SCORE_THRESHOLDS;
  }
}
