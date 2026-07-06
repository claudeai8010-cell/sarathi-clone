import { z } from 'zod';

import {
  ExpenseCategory,
  FuelType,
  SyncStatus,
  TripStatus,
} from '@/types/database';

// ============================================================
// SHARED VALIDATORS
// ============================================================

const phoneSchema = z
  .string()
  .min(10, 'Phone must be at least 10 digits')
  .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format');

const vehicleNumberSchema = z
  .string()
  .min(1, 'Vehicle number is required')
  .max(20, 'Vehicle number too long')
  .transform((v) => v.toUpperCase().trim());

const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

const positiveNumberSchema = z.number().positive('Must be greater than 0');

const nonNegativeNumberSchema = z.number().min(0, 'Must be 0 or greater');

const confidenceScoreSchema = z
  .number()
  .min(0, 'Confidence score must be between 0 and 100')
  .max(100, 'Confidence score must be between 0 and 100');

const ratingSchema = z
  .number()
  .min(1, 'Rating must be between 1 and 5')
  .max(5, 'Rating must be between 1 and 5');

// ============================================================
// USER SCHEMAS
// ============================================================

export const CreateUserSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  phone: phoneSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  vehicleModel: z
    .string()
    .min(1, 'Vehicle model is required')
    .max(100, 'Vehicle model too long')
    .trim(),
  vehicleNumber: vehicleNumberSchema,
  fuelType: z.nativeEnum(FuelType, { errorMap: () => ({ message: 'Invalid fuel type' }) }),
  baseMileage: positiveNumberSchema.describe('km/L — must be greater than 0'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  vehicleModel: z.string().min(1).max(100).trim().optional(),
  vehicleNumber: vehicleNumberSchema.optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  baseMileage: positiveNumberSchema.optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// ============================================================
// TRIP SCHEMAS
// ============================================================

export const CreateTripSchema = z.object({
  tripId: z.string().min(1, 'tripId is required'),
  user: mongoIdSchema,
  status: z.nativeEnum(TripStatus).optional().default(TripStatus.New),
  pickupLocation: z.string().min(1, 'Pickup location is required').trim(),
  dropLocation: z.string().min(1, 'Drop location is required').trim(),
  payloadKg: nonNegativeNumberSchema.describe('Payload weight in kg'),
  grossRevenue: nonNegativeNumberSchema.describe('Gross revenue in INR'),
  estimatedFuelCost: nonNegativeNumberSchema,
  estimatedToll: nonNegativeNumberSchema,
  netProfit: z.number().describe('Can be negative if costs exceed revenue'),
  confidenceScore: confidenceScoreSchema,
});

export const UpdateTripSchema = z.object({
  status: z.nativeEnum(TripStatus).optional(),
  pickupLocation: z.string().min(1).trim().optional(),
  dropLocation: z.string().min(1).trim().optional(),
  payloadKg: nonNegativeNumberSchema.optional(),
  grossRevenue: nonNegativeNumberSchema.optional(),
  estimatedFuelCost: nonNegativeNumberSchema.optional(),
  estimatedToll: nonNegativeNumberSchema.optional(),
  netProfit: z.number().optional(),
  confidenceScore: confidenceScoreSchema.optional(),
  syncStatus: z.nativeEnum(SyncStatus).optional(),
});

export type CreateTripInput = z.infer<typeof CreateTripSchema>;
export type UpdateTripInput = z.infer<typeof UpdateTripSchema>;

// ============================================================
// EXPENSE SCHEMAS
// ============================================================

export const CreateExpenseSchema = z.object({
  expenseId: z.string().min(1, 'expenseId is required'),
  user: mongoIdSchema,
  trip: mongoIdSchema.optional(),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  amount: positiveNumberSchema.describe('Amount in INR — must be greater than 0'),
  notes: z.string().max(500, 'Notes too long').trim().optional().default(''),
  receiptImageUrl: z.string().url('Invalid URL').optional(),
});

export const UpdateExpenseSchema = z.object({
  category: z.nativeEnum(ExpenseCategory).optional(),
  amount: positiveNumberSchema.optional(),
  notes: z.string().max(500).trim().optional(),
  receiptImageUrl: z.string().url().nullable().optional(),
  syncStatus: z.nativeEnum(SyncStatus).optional(),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;

// ============================================================
// BROKER SCHEMAS
// ============================================================

export const CreateBrokerSchema = z.object({
  brokerId: z.string().min(1, 'brokerId is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  phone: phoneSchema,
  company: z.string().max(100).trim().optional().default(''),
  averagePaymentDelay: z
    .number()
    .min(0, 'Payment delay cannot be negative')
    .optional()
    .default(0),
  rating: ratingSchema.optional().default(3),
  notes: z.string().max(1000, 'Notes too long').trim().optional().default(''),
});

export const UpdateBrokerSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  phone: phoneSchema.optional(),
  company: z.string().max(100).trim().optional(),
  averagePaymentDelay: z.number().min(0).optional(),
  rating: ratingSchema.optional(),
  notes: z.string().max(1000).trim().optional(),
});

export type CreateBrokerInput = z.infer<typeof CreateBrokerSchema>;
export type UpdateBrokerInput = z.infer<typeof UpdateBrokerSchema>;
