import 'server-only';

import { randomUUID } from 'crypto';


import { created, fail, handleApiError, ok } from '@/lib/api/response';
import { CreateExpenseBodySchema } from '@/lib/api/schemas';
import { expenseService } from '@/lib/container';

import type { NextRequest } from 'next/server';

// GET /v1/expenses?userId=<userId>
// GET /v1/expenses?tripId=<tripId>
// Provide exactly one of userId or tripId. userId returns all expenses
// for a driver; tripId returns expenses linked to a specific trip.
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const tripId = req.nextUrl.searchParams.get('tripId');

    if (userId) {
      const expenses = await expenseService.listByUser(userId);
      return ok(expenses, requestId);
    }

    if (tripId) {
      const expenses = await expenseService.listByTrip(tripId);
      return ok(expenses, requestId);
    }

    return fail(400, 'Provide userId or tripId as a query parameter', 'MISSING_PARAM', requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

// POST /v1/expenses — record a new expense
// category auto-inferred from notes when keywords match (e.g. "toll", "dhaba")
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = CreateExpenseBodySchema.parse(await req.json());
    const expense = await expenseService.createExpense({
      expenseId: body.expenseId ?? randomUUID(),
      userId: body.userId,
      tripId: body.tripId,
      category: body.category,
      amount: body.amount,
      notes: body.notes,
      receiptImageUrl: body.receiptImageUrl,
    });
    return created(expense, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
