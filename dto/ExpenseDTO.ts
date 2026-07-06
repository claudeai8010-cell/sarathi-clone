import 'server-only';

import type { ExpenseCategory, SyncStatus } from '@/types/database';

// ============================================================
// Expense DTOs
// Services exchange these — never raw Mongoose documents.
// ============================================================

export interface CreateExpenseDTO {
  readonly expenseId: string;
  readonly userId: string;
  readonly tripId?: string;
  readonly category: ExpenseCategory;
  readonly amount: number;
  readonly notes?: string;
  readonly receiptImageUrl?: string;
}

export interface UpdateExpenseDTO {
  readonly category?: ExpenseCategory;
  readonly amount?: number;
  readonly notes?: string;
  readonly receiptImageUrl?: string | null;
  readonly syncStatus?: SyncStatus;
}

export interface ExpenseSummaryDTO {
  readonly expenseId: string;
  readonly mongoId: string;
  readonly userId: string;
  readonly tripId: string | null;
  readonly category: ExpenseCategory;
  readonly amount: number;
  readonly notes: string;
  readonly receiptImageUrl: string | null;
  readonly syncStatus: SyncStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
