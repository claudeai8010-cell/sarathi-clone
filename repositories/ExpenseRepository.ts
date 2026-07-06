import 'server-only';


import { NotFoundError } from '@/lib/db/errors';
import { ExpenseModel } from '@/models/Expense';

import { BaseRepository } from './BaseRepository';

import type {
  CreateExpenseDto,
  ExpenseCategory,
  IExpenseDocument,
  PaginateOptions,
  PaginatedResult,
  SyncStatus,
  UpdateExpenseDto,
} from '@/types/database';
import type { FilterQuery, Model, Types } from 'mongoose';

export class ExpenseRepository extends BaseRepository<
  IExpenseDocument,
  CreateExpenseDto,
  UpdateExpenseDto
> {
  protected readonly model: Model<IExpenseDocument> = ExpenseModel;

  async findByExpenseId(expenseId: string): Promise<IExpenseDocument | null> {
    return this.findOne({ expenseId } as FilterQuery<IExpenseDocument>);
  }

  async findByExpenseIdOrThrow(expenseId: string): Promise<IExpenseDocument> {
    const expense = await this.findByExpenseId(expenseId);
    if (!expense) throw new NotFoundError('Expense', expenseId);
    return expense;
  }

  async findByUser(userId: Types.ObjectId | string): Promise<IExpenseDocument[]> {
    return this.findMany({ user: userId } as FilterQuery<IExpenseDocument>);
  }

  async findByTrip(tripId: Types.ObjectId | string): Promise<IExpenseDocument[]> {
    return this.findMany({ trip: tripId } as FilterQuery<IExpenseDocument>);
  }

  async findByUserAndCategory(
    userId: Types.ObjectId | string,
    category: ExpenseCategory,
  ): Promise<IExpenseDocument[]> {
    return this.findMany({ user: userId, category } as FilterQuery<IExpenseDocument>);
  }

  async findBySyncStatus(syncStatus: SyncStatus): Promise<IExpenseDocument[]> {
    return this.findMany({ syncStatus } as FilterQuery<IExpenseDocument>);
  }

  async paginateByUser(
    userId: Types.ObjectId | string,
    options: PaginateOptions,
  ): Promise<PaginatedResult<IExpenseDocument>> {
    return this.paginate({ user: userId } as FilterQuery<IExpenseDocument>, options);
  }

  async totalAmountByUser(userId: Types.ObjectId | string): Promise<number> {
    await this.ensureConnected();
    const result = await this.model.aggregate<{ total: number }>([
      { $match: { user: userId, deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async totalAmountByTrip(tripId: Types.ObjectId | string): Promise<number> {
    await this.ensureConnected();
    const result = await this.model.aggregate<{ total: number }>([
      { $match: { trip: tripId, deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }
}

export const expenseRepository = new ExpenseRepository();
