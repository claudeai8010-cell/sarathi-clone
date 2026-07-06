import 'server-only';

import type { Document, Types } from 'mongoose';

// ============================================================
// ENUMS
// ============================================================

export enum FuelType {
  Petrol = 'Petrol',
  Diesel = 'Diesel',
  ICNG = 'iCNG',
}

export enum TripStatus {
  New = 'New',
  Accepted = 'Accepted',
  Loaded = 'Loaded',
  InTransit = 'In Transit',
  Delivered = 'Delivered',
  Paid = 'Paid',
}

export enum SyncStatus {
  Pending = 'Pending',
  Synced = 'Synced',
}

export enum ExpenseCategory {
  Fuel = 'Fuel',
  Toll = 'Toll',
  Maintenance = 'Maintenance',
  BrokerFee = 'Broker Fee',
  Food = 'Food',
  Parking = 'Parking',
  Repair = 'Repair',
  Other = 'Other',
}

// ============================================================
// SOFT DELETE — shared by all entities
// ============================================================

export interface SoftDeletable {
  deletedAt: Date | null;
}

// ============================================================
// PAGINATION UTILITIES
// ============================================================

export interface PaginateOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// USER
// ============================================================

export interface IUser extends SoftDeletable {
  userId: string;
  phone: string;
  name: string;
  vehicleModel: string;
  vehicleNumber: string;
  fuelType: FuelType;
  baseMileage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

export interface CreateUserDto {
  userId: string;
  phone: string;
  name: string;
  vehicleModel: string;
  vehicleNumber: string;
  fuelType: FuelType;
  baseMileage: number;
}

export interface UpdateUserDto {
  name?: string;
  vehicleModel?: string;
  vehicleNumber?: string;
  fuelType?: FuelType;
  baseMileage?: number;
}

// ============================================================
// TRIP
// ============================================================

export interface ITrip extends SoftDeletable {
  tripId: string;
  user: Types.ObjectId;
  status: TripStatus;
  pickupLocation: string;
  dropLocation: string;
  payloadKg: number;
  grossRevenue: number;
  estimatedFuelCost: number;
  estimatedToll: number;
  netProfit: number;
  confidenceScore: number;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITripDocument extends ITrip, Document {
  _id: Types.ObjectId;
}

export interface CreateTripDto {
  tripId: string;
  user: string;
  status?: TripStatus;
  pickupLocation: string;
  dropLocation: string;
  payloadKg: number;
  grossRevenue: number;
  estimatedFuelCost: number;
  estimatedToll: number;
  netProfit: number;
  confidenceScore: number;
}

export interface UpdateTripDto {
  status?: TripStatus;
  pickupLocation?: string;
  dropLocation?: string;
  payloadKg?: number;
  grossRevenue?: number;
  estimatedFuelCost?: number;
  estimatedToll?: number;
  netProfit?: number;
  confidenceScore?: number;
  syncStatus?: SyncStatus;
}

// ============================================================
// EXPENSE
// ============================================================

export interface IExpense extends SoftDeletable {
  expenseId: string;
  user: Types.ObjectId;
  trip: Types.ObjectId | null;
  category: ExpenseCategory;
  amount: number;
  notes: string;
  receiptImageUrl: string | null;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpenseDocument extends IExpense, Document {
  _id: Types.ObjectId;
}

export interface CreateExpenseDto {
  expenseId: string;
  user: string;
  trip?: string;
  category: ExpenseCategory;
  amount: number;
  notes?: string;
  receiptImageUrl?: string;
}

export interface UpdateExpenseDto {
  category?: ExpenseCategory;
  amount?: number;
  notes?: string;
  receiptImageUrl?: string | null;
  syncStatus?: SyncStatus;
}

// ============================================================
// BROKER
// ============================================================

export interface IBroker extends SoftDeletable {
  brokerId: string;
  name: string;
  phone: string;
  company: string;
  averagePaymentDelay: number;
  rating: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrokerDocument extends IBroker, Document {
  _id: Types.ObjectId;
}

export interface CreateBrokerDto {
  brokerId: string;
  name: string;
  phone: string;
  company?: string;
  averagePaymentDelay?: number;
  rating?: number;
  notes?: string;
}

export interface UpdateBrokerDto {
  name?: string;
  phone?: string;
  company?: string;
  averagePaymentDelay?: number;
  rating?: number;
  notes?: string;
}
