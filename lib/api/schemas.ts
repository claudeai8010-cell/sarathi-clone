import 'server-only';

import { z } from 'zod';

import { ExpenseCategory, FuelType, SyncStatus, TripStatus } from '@/types/database';

// ============================================================
// Route-level request schemas
// These validate API request bodies — NOT the database schemas
// in src/schemas/validation.ts (which use MongoDB ObjectIds).
// Route schemas use business IDs: userId, tripId, expenseId,
// brokerId — all plain strings, not MongoDB ObjectIds.
// ============================================================

const phoneSchema = z
  .string()
  .min(10, 'Phone must be at least 10 digits')
  .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format');

// ── USERS ────────────────────────────────────────────────────

export const CreateUserBodySchema = z.object({
  userId: z.string().min(1).optional(),
  phone: phoneSchema,
  name: z.string().min(1, 'Name is required').max(100).trim(),
  vehicleModel: z.string().min(1, 'Vehicle model is required').max(100).trim(),
  vehicleNumber: z.string().min(1).max(20).transform((v) => v.toUpperCase().trim()),
  fuelType: z.nativeEnum(FuelType, { errorMap: () => ({ message: 'Invalid fuel type' }) }),
  baseMileage: z.number().positive('baseMileage must be greater than 0'),
});

export const UpdateUserBodySchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  vehicleModel: z.string().min(1).max(100).trim().optional(),
  vehicleNumber: z
    .string()
    .min(1)
    .max(20)
    .transform((v) => v.toUpperCase().trim())
    .optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  baseMileage: z.number().positive().optional(),
});

// ── TRIPS ────────────────────────────────────────────────────

export const CreateTripBodySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  tripId: z.string().min(1).optional(),
  parsed: z.object({
    pickupLocation: z.string().min(1, 'pickupLocation is required').trim(),
    dropLocation: z.string().min(1, 'dropLocation is required').trim(),
    payloadKg: z.number().min(0),
    grossRevenue: z.number().min(0),
    rawInput: z.string().default(''),
    notes: z.string().default(''),
    confidence: z.number().min(0).max(1).default(1),
    missingFields: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
  }),
});

export const ParseTripBodySchema = z.object({
  text: z.string().min(1, 'text is required'),
});

export const TransitionStatusBodySchema = z.object({
  status: z.nativeEnum(TripStatus, { errorMap: () => ({ message: 'Invalid trip status' }) }),
});

// ── EXPENSES ─────────────────────────────────────────────────

export const CreateExpenseBodySchema = z.object({
  expenseId: z.string().min(1).optional(),
  userId: z.string().min(1, 'userId is required'),
  tripId: z.string().optional(),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Invalid expense category' }),
  }),
  amount: z.number().positive('amount must be greater than 0'),
  notes: z.string().max(500).trim().optional(),
  receiptImageUrl: z.string().url('Invalid receipt URL').optional(),
});

export const UpdateExpenseBodySchema = z.object({
  category: z.nativeEnum(ExpenseCategory).optional(),
  amount: z.number().positive().optional(),
  notes: z.string().max(500).trim().optional(),
  receiptImageUrl: z.string().url().nullable().optional(),
  syncStatus: z.nativeEnum(SyncStatus).optional(),
});

// ── AUTH ─────────────────────────────────────────────────────

export const LoginBodySchema = z.object({
  phone: phoneSchema,
});

export const VerifyBodySchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

// ── AI ────────────────────────────────────────────────────────

export const AiParseBodySchema = z.object({
  rawText: z.string().min(1, 'rawText is required').max(2000, 'rawText too long'),
});

// ── BROKERS ──────────────────────────────────────────────────

export const CreateBrokerBodySchema = z.object({
  brokerId: z.string().min(1).optional(),
  name: z.string().min(1, 'Name is required').max(100).trim(),
  phone: phoneSchema,
  company: z.string().max(100).trim().optional(),
  averagePaymentDelay: z.number().min(0).optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().max(1000).trim().optional(),
});

export const UpdateBrokerBodySchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  phone: phoneSchema.optional(),
  company: z.string().max(100).trim().optional(),
  averagePaymentDelay: z.number().min(0).optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().max(1000).trim().optional(),
});
