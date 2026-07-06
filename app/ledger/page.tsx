'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Plus } from 'lucide-react';
import { useExpenses, useWeeklyAnalytics } from '@/hooks';

function ExpenseCard({ expense }: { expense: any }) {
  const categoryColors: Record<string, string> = {
    'Fuel': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'Toll': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'Maintenance': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'Broker Fee': 'bg-red-500/10 text-red-600 dark:text-red-400',
    'Food': 'bg-green-500/10 text-green-600 dark:text-green-400',
    'Parking': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    'Repair': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    'Other': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  };

  return (
    <Card className="border-0 bg-card/50">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{expense.category}</p>
              <p className="text-lg font-semibold text-foreground">
                ₹{expense.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <Badge className={categoryColors[expense.category] || 'bg-gray-500/10'}>
              {expense.category}
            </Badge>
          </div>

          {expense.notes && (
            <p className="text-sm text-muted-foreground">{expense.notes}</p>
          )}

          <p className="text-xs text-muted-foreground">
            {new Date(expense.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LedgerPage() {
  const today = new Date();
  const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data: expenses, isLoading: expensesLoading, error: expensesError } = useExpenses();
  const { data: weekly, isLoading: weeklyLoading, error: weeklyError } = useWeeklyAnalytics(weekStart, today);

  const error = expensesError || weeklyError;

  if (error) {
    return (
      <div className="space-y-6 pb-8">
        <div className="space-y-2 p-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Ledger</h1>
          <p className="text-sm text-muted-foreground">Track all your expenses</p>
        </div>
        <div className="space-y-3 px-4">
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Failed to load ledger</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2 p-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Ledger</h1>
        <p className="text-sm text-muted-foreground">Track all your expenses</p>
      </div>

      {/* Action Button */}
      <div className="space-y-3 px-4">
        <Button size="lg" className="w-full">
          <Plus className="mr-2 h-5 w-5" />
          Add Expense
        </Button>
      </div>

      {/* Weekly Summary */}
      {!weeklyLoading && weekly && (
        <div className="space-y-3 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Summary</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 rounded-lg bg-green-500/10 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-semibold text-foreground">
                    ₹{weekly.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1 rounded-lg bg-red-500/10 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-lg font-semibold text-foreground">
                    ₹{weekly.totalExpenses.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1 rounded-lg bg-blue-500/10 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Total Profit</p>
                  <p className="text-lg font-semibold text-foreground">
                    ₹{weekly.totalProfit.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-1 rounded-lg bg-purple-500/10 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Avg Profit</p>
                  <p className="text-lg font-semibold text-foreground">
                    ₹{weekly.averageTripProfit.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3 px-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Expenses</h3>
        {expensesLoading ? (
          <>
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </>
        ) : !expenses || expenses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No Expenses</CardTitle>
              <CardDescription>Your expense log is empty</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add expenses to track your spending and improve profitability
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseCard key={expense.expenseId} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
