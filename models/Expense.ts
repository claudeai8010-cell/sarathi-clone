/**
 * Expense model — FOR REPOSITORY USE ONLY.
 * Do not import or query this model outside of ExpenseRepository.
 */
import 'server-only';

import mongoose, { type Model, Schema } from 'mongoose';

import { ExpenseCategory, SyncStatus } from '@/types/database';

import type { IExpenseDocument } from '@/types/database';

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    expenseId: {
      type: String,
      required: [true, 'expenseId is required'],
      unique: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    category: {
      type: String,
      enum: {
        values: Object.values(ExpenseCategory),
        message: 'Invalid expense category: {VALUE}',
      },
      required: [true, 'Category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Notes too long'],
    },
    receiptImageUrl: {
      type: String,
      default: null,
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
    collection: 'expenses',
    optimisticConcurrency: true,
  },
);

ExpenseSchema.index({ expenseId: 1 }, { unique: true });
ExpenseSchema.index({ user: 1 });
ExpenseSchema.index({ trip: 1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ createdAt: -1 });
ExpenseSchema.index({ user: 1, createdAt: -1 });

export const ExpenseModel: Model<IExpenseDocument> =
  (mongoose.models['Expense'] as Model<IExpenseDocument> | undefined) ??
  mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
