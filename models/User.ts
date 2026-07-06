/**
 * User model — FOR REPOSITORY USE ONLY.
 * Do not import or query this model outside of UserRepository.
 */
import 'server-only';

import mongoose, { type Model, Schema } from 'mongoose';

import { FuelType } from '@/types/database';

import type { IUserDocument } from '@/types/database';

const UserSchema = new Schema<IUserDocument>(
  {
    userId: {
      type: String,
      required: [true, 'userId is required'],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [1, 'Name cannot be empty'],
      maxlength: [100, 'Name too long'],
    },
    vehicleModel: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
      maxlength: [100, 'Vehicle model too long'],
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true,
      uppercase: true,
      maxlength: [20, 'Vehicle number too long'],
    },
    fuelType: {
      type: String,
      enum: {
        values: Object.values(FuelType),
        message: 'Invalid fuel type: {VALUE}',
      },
      required: [true, 'Fuel type is required'],
    },
    baseMileage: {
      type: Number,
      required: [true, 'Base mileage is required'],
      min: [0.1, 'Mileage must be greater than 0'],
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

UserSchema.index({ userId: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });

export const UserModel: Model<IUserDocument> =
  (mongoose.models['User'] as Model<IUserDocument> | undefined) ??
  mongoose.model<IUserDocument>('User', UserSchema);
