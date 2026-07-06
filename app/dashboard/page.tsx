'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { useDailyAnalytics } from '@/hooks';

// Dashboard Financial Cards
function FinancialCard({
  title,
  amount,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  amount: string;
  icon: React.ReactNode;
  trend?: string;
  color: 'green' | 'red' | 'blue';
}) {
  const colors = {
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };

  return (
    <Card className="border-0 bg-card/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{amount}</p>
            {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
          </div>
          <div className={`rounded-lg p-3 ${colors[color]}`}>{Icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Trip Score Badge
function TripScoreBadge({
  score,
  label,
}: {
  score: number | null;
  label: 'excellent' | 'good' | 'fair' | 'poor' | null;
}) {
  if (score === null || label === null) {
    return <Skeleton className="h-8 w-24" />;
  }

  const colors = {
    excellent: 'bg-green-500 text-white',
    good: 'bg-blue-500 text-white',
    fair: 'bg-yellow-500 text-black',
    poor: 'bg-red-500 text-white',
  };

  return (
    <Badge className={`h-8 px-3 py-2 text-sm font-semibold ${colors[label]}`}>
      Score: {score}
    </Badge>
  );
}

// Skeleton Loaders
function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDailyAnalytics();

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Today's Summary</h1>
          <p className="text-sm text-muted-foreground">Track your daily performance</p>
        </div>
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Failed to load dashboard</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <DashboardSkeleton />
      </div>
    );
  }

  // Determine trip score and label (placeholder - will be populated from trip data in future)
  const tripScore = null;
  const tripScoreLabel = null;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-2 p-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Today's Summary</h1>
        <p className="text-sm text-muted-foreground">Track your daily performance</p>
      </div>

      {/* Financial Cards */}
      <div className="space-y-3 px-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </>
        ) : !data || data.tripCount === 0 ? (
          <Card className="border-0 bg-card/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">No trips yet today</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <FinancialCard
              title="Today's Revenue"
              amount={`₹${data.totalRevenue.toLocaleString('en-IN')}`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="green"
            />
            <FinancialCard
              title="Today's Expenses"
              amount={`₹${data.totalExpenses.toLocaleString('en-IN')}`}
              icon={<TrendingDown className="h-5 w-5" />}
              color="red"
            />
            <FinancialCard
              title="Net Profit"
              amount={`₹${data.totalProfit.toLocaleString('en-IN')}`}
              icon={<Wallet className="h-5 w-5" />}
              color="blue"
              trend={`${data.tripCount} ${data.tripCount === 1 ? 'trip' : 'trips'}`}
            />
          </>
        )}
      </div>

      {/* Trip Score Card */}
      <div className="space-y-3 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trip Score</CardTitle>
            <CardDescription>Your trip profitability rating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading || tripScore === null ? (
              <>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <TripScoreBadge score={tripScore} label={tripScoreLabel} />
                <p className="text-sm text-muted-foreground">
                  Based on fuel efficiency, route optimization, and expense management
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Trip Card */}
      <div className="space-y-3 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Trip</CardTitle>
            <CardDescription>Your current journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pickup Location</span>
                  <span className="text-sm font-medium text-foreground">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Drop Location</span>
                  <span className="text-sm font-medium text-foreground">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <span className="text-sm font-medium text-foreground">— km</span>
                </div>
              </div>
            )}
            <Button variant="outline" size="lg" className="w-full">
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 px-4">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg">
            Add Expense
          </Button>
          <Button variant="secondary" size="lg">
            New Trip
          </Button>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="space-y-3 px-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Expenses</h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        <Card className="border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No expenses logged today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
