/**
 * Trip model — FOR REPOSITORY USE ONLY.
 * Do not import or query this model outside of TripRepository.
 */
import 'server-only';

import mongoose, { type Model, Schema, Types } from 'mongoose';

import { SyncStatus, TripStatus } from '@/types/database';

import type { ITripDocument } from '@/types/database';

const TripSchema = new Schema<ITripDocument>(
  {
    tripId: {
      type: String,
      required: [true, 'tripId is required'],
      unique: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TripStatus),
        message: 'Invalid trip status: {VALUE}',
      },
      required: [true, 'Status is required'],
      default: TripStatus.New,
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
    },
    dropLocation: {
      type: String,
      required: [true, 'Drop location is required'],
      trim: true,
    },
    payloadKg: {
      type: Number,
      required: [true, 'Payload is required'],
      min: [0, 'Payload cannot be negative'],
    },
    grossRevenue: {
      type: Number,
      required: [true, 'Gross revenue is required'],
      min: [0, 'Revenue cannot be negative'],
    },
    estimatedFuelCost: {
      type: Number,
      required: [true, 'Estimated fuel cost is required'],
      min: [0, 'Fuel cost cannot be negative'],
    },
    estimatedToll: {
      type: Number,
      required: [true, 'Estimated toll is required'],
      min: [0, 'Toll cannot be negative'],
    },
    netProfit: {
      type: Number,
      required: [true, 'Net profit is required'],
    },
    confidenceScore: {
      type: Number,
      required: [true, 'Confidence score is required'],
      min: [0, 'Confidence score must be between 0 and 100'],
      max: [100, 'Confidence score must be between 0 and 100'],
    },
    syncStatus: {
      type: String,
      enum: {
        values: Object.values(SyncStatus),
        message: 'Invalid sync status: {VALUE}',
      },
      required: [true, 'Sync status is required'],
      default: SyncStatus.Pending,
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: 'trips',
    optimisticConcurrency: true,
  },
);

TripSchema.index({ tripId: 1 }, { unique: true });
TripSchema.index({ user: 1 });
TripSchema.index({ status: 1 });
TripSchema.index({ createdAt: -1 });
TripSchema.index({ user: 1, createdAt: -1 });

// Suppress unused import warning — Types is needed for the ObjectId ref type
void Types;

export const TripModel: Model<ITripDocument> =
  (mongoose.models['Trip'] as Model<ITripDocument> | undefined) ??
  mongoose.model<ITripDocument>('Trip', TripSchema);
