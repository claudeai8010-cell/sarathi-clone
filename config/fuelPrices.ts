import 'server-only';

import { FuelType } from '@/types/database';

// ============================================================
// FUEL PRICES — INR per litre (India averages, mid-2024)
// Update this config when prices change; never hardcode elsewhere.
// ============================================================

export const FUEL_PRICES_INR: Record<FuelType, number> = {
  [FuelType.Petrol]: 106.31,
  [FuelType.Diesel]: 92.18,
  [FuelType.ICNG]: 79.0,
} as const;

// Adulteration / seasonal variance buffer (percentage)
export const FUEL_PRICE_BUFFER_PCT = 5;

export function getFuelPriceWithBuffer(fuelType: FuelType): number {
  const base = FUEL_PRICES_INR[fuelType];
  return base * (1 + FUEL_PRICE_BUFFER_PCT / 100);
}
