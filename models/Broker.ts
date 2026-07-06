/**
 * Broker model — FOR REPOSITORY USE ONLY.
 * Do not import or query this model outside of BrokerRepository.
 */
import 'server-only';

import mongoose, { type Model, Schema } from 'mongoose';

import type { IBrokerDocument } from '@/types/database';

const BrokerSchema = new Schema<IBrokerDocument>(
  {
    brokerId: {
      type: String,
      required: [true, 'brokerId is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name too long'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'],
    },
    company: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Company name too long'],
    },
    averagePaymentDelay: {
      type: Number,
      default: 0,
      min: [0, 'Payment delay cannot be negative'],
    },
    rating: {
      type: Number,
      default: 3,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Notes too long'],
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: 'brokers',
  },
);

BrokerSchema.index({ brokerId: 1 }, { unique: true });
BrokerSchema.index({ phone: 1 }, { unique: true });

export const BrokerModel: Model<IBrokerDocument> =
  (mongoose.models['Broker'] as Model<IBrokerDocument> | undefined) ??
  mongoose.model<IBrokerDocument>('Broker', BrokerSchema);
