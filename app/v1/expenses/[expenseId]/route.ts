import 'server-only';


import { handleApiError, noContent, ok } from '@/lib/api/response';
import { UpdateExpenseBodySchema } from '@/lib/api/schemas';
import { expenseService } from '@/lib/container';

import type { NextRequest } from 'next/server';

type Ctx = { params: { expenseId: string } };

// GET /v1/expenses/:expenseId — fetch a single expense
export async function GET(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const expense = await expenseService.getExpenseById(params.expenseId);
    return ok(expense, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

// PATCH /v1/expenses/:expenseId — update fields on an expense
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    const body = UpdateExpenseBodySchema.parse(await req.json());
    const expense = await expenseService.updateExpense(params.expenseId, body);
    return ok(expense, requestId);
  } catch (err) {
    return handleApiError(err, requestId);
  }
}

// DELETE /v1/expenses/:expenseId — soft-delete an expense
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const requestId = req.headers.get('x-request-id') ?? undefined;
  try {
    await expenseService.deleteExpense(params.expenseId);
    return noContent();
  } catch (err) {
    return handleApiError(err, requestId);
  }
}
