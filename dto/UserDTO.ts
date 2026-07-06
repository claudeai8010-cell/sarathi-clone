import 'server-only';

import type { FuelType } from '@/types/database';

// ============================================================
// User DTOs
// Services exchange these — never raw Mongoose documents.
// ============================================================

export interface CreateUserDTO {
  readonly userId: string;
  readonly phone: string;
  readonly name: string;
  readonly vehicleModel: string;
  readonly vehicleNumber: string;
  readonly fuelType: FuelType;
  readonly baseMileage: number;
}

export interface UpdateUserDTO {
  readonly name?: string;
  readonly vehicleModel?: string;
  readonly vehicleNumber?: string;
  readonly fuelType?: FuelType;
  readonly baseMileage?: number;
}

export interface UserSummaryDTO {
  readonly userId: string;
  readonly mongoId: string;
  readonly phone: string;
  readonly name: string;
  readonly vehicleModel: string;
  readonly vehicleNumber: string;
  readonly fuelType: FuelType;
  readonly baseMileage: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
