import 'server-only';

import { DomainException } from '@/exceptions/DomainException';
import { NotFoundError } from '@/lib/db/errors';
import { ExpenseCategory } from '@/types/database';

import type { CreateExpenseDTO, ExpenseSummaryDTO, UpdateExpenseDTO } from '@/dto/ExpenseDTO';
import type { ILogger } from '@/lib/logger';
import type { ExpenseRepository } from '@/repositories/ExpenseRepository';
import type { TripRepository } from '@/repositories/TripRepository';
import type { IExpenseDocument } from '@/types/database';


// ============================================================
// ExpenseService
// Validates expenses, verifies trip ownership,
// auto-categorizes fuel-related expenses.
// Never exposes Mongoose documents.
// ============================================================

const FUEL_KEYWORDS = ['fuel', 'petrol', 'diesel', 'cng', 'gas', 'refuel', 'bhaari', 'tel'];

function inferCategoryFromNotes(notes: string): ExpenseCategory | null {
  const lower = notes.toLowerCase();
  if (FUEL_KEYWORDS.some((kw) => lower.includes(kw))) return ExpenseCategory.Fuel;
  if (lower.includes('toll') || lower.includes('naka')) return ExpenseCategory.Toll;
  if (lower.includes('repair') || lower.includes('mechanic')) return ExpenseCategory.Repair;
  if (lower.includes('mainten') || lower.includes('service')) return ExpenseCategory.Maintenance;
  if (lower.includes('food') || lower.includes('dhaba') || lower.includes('meal')) return ExpenseCategory.Food;
  if (lower.includes('park')) return ExpenseCategory.Parking;
  if (lower.includes('broker') || lower.includes('commission')) return ExpenseCategory.BrokerFee;
  return null;
}

function toExpenseSummary(doc: IExpenseDocument): ExpenseSummaryDTO {
  return {
    expenseId: doc.expenseId,
    mongoId: doc._id.toString(),
    userId: doc.user.toString(),
    tripId: doc.trip ? doc.trip.toString() : null,
    category: doc.category,
    amount: doc.amount,
    notes: doc.notes,
    receiptImageUrl: doc.receiptImageUrl,
    syncStatus: doc.syncStatus,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class ExpenseService {
  constructor(
    private readonly expenseRepo: ExpenseRepository,
    private readonly tripRepo: TripRepository,
    private readonly log: ILogger,
  ) {}

  /**
   * Auto-categorize based on notes if no category override is needed.
   * Caller may supply a category; this method only suggests when missing.
   */
  suggestCategory(notes: string, current: ExpenseCategory): ExpenseCategory {
    if (!notes.trim()) return current;
    return inferCategoryFromNotes(notes) ?? current;
  }

  async createExpense(dto: CreateExpenseDTO): Promise<ExpenseSummaryDTO> {
    this.log.info('ExpenseService.createExpense: start', {
      expenseId: dto.expenseId,
      userId: dto.userId,
      category: dto.category,
    });

    // Verify trip ownership when tripId is supplied
    if (dto.tripId) {
      const trip = await this.tripRepo.findByTripId(dto.tripId);
      if (!trip) throw new NotFoundError('Trip', dto.tripId);
      if (trip.user.toString() !== dto.userId) {
        throw new DomainException(
          `Trip '${dto.tripId}' does not belong to user '${dto.userId}'`,
          'TRIP_OWNERSHIP_VIOLATION',
          403,
        );
      }
    }

    const finalCategory = this.suggestCategory(dto.notes ?? '', dto.category);

    const doc = await this.expenseRepo.create({
      expenseId: dto.expenseId,
      user: dto.userId,
      trip: dto.tripId,
      category: finalCategory,
      amount: dto.amount,
      notes: dto.notes ?? '',
      receiptImageUrl: dto.receiptImageUrl,
    });

    this.log.info('ExpenseService.createExpense: complete', {
      expenseId: doc.expenseId,
      category: doc.category,
    });

    return toExpenseSummary(doc);
  }

  async getExpenseById(expenseId: string): Promise<ExpenseSummaryDTO> {
    this.log.debug('ExpenseService.getExpenseById', { expenseId });
    const doc = await this.expenseRepo.findByExpenseIdOrThrow(expenseId);
    return toExpenseSummary(doc);
  }

  async updateExpense(expenseId: string, dto: UpdateExpenseDTO): Promise<ExpenseSummaryDTO> {
    this.log.info('ExpenseService.updateExpense: start', { expenseId });
    const existing = await this.expenseRepo.findByExpenseIdOrThrow(expenseId);
    const updated = await this.expenseRepo.update(existing._id.toString(), dto);
    if (!updated) throw new NotFoundError('Expense', expenseId);
    this.log.info('ExpenseService.updateExpense: complete', { expenseId });
    return toExpenseSummary(updated);
  }

  async deleteExpense(expenseId: string): Promise<void> {
    this.log.info('ExpenseService.deleteExpense', { expenseId });
    const existing = await this.expenseRepo.findByExpenseIdOrThrow(expenseId);
    await this.expenseRepo.delete(existing._id.toString());
  }

  async listByUser(userId: string): Promise<ExpenseSummaryDTO[]> {
    const docs = await this.expenseRepo.findByUser(userId);
    return docs.map(toExpenseSummary);
  }

  async listByTrip(tripId: string): Promise<ExpenseSummaryDTO[]> {
    const docs = await this.expenseRepo.findByTrip(tripId);
    return docs.map(toExpenseSummary);
  }

  async totalAmountByUser(userId: string): Promise<number> {
    return this.expenseRepo.totalAmountByUser(userId);
  }
}
