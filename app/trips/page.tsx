'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useTrips } from '@/hooks';

function TripCard({ trip }: { trip: any }) {
  const tripStatusColors: Record<string, string> = {
    'New': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'Accepted': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'Loaded': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    'In Transit': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'Delivered': 'bg-green-500/10 text-green-600 dark:text-green-400',
    'Paid': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <Card className="border-0 bg-card/50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Trip #{trip.tripId}</p>
              <p className="text-lg font-semibold text-foreground">
                ₹{trip.grossRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <Badge className={tripStatusColors[trip.status] || 'bg-gray-500/10'}>
              {trip.status}
            </Badge>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">From</span>
              <span className="font-medium text-foreground">{trip.pickupLocation}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">To</span>
              <span className="font-medium text-foreground">{trip.dropLocation}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium text-foreground">{trip.distanceKm} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Profit</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                ₹{trip.netProfit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button variant="ghost" size="sm" className="w-full">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TripsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: trips, isLoading, error } = useTrips({
    status: statusFilter,
  });

  if (error) {
    return (
      <div className="space-y-6 pb-8">
        <div className="space-y-2 p-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Trips</h1>
          <p className="text-sm text-muted-foreground">View all your trips and details</p>
        </div>
        <div className="space-y-3 px-4">
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Failed to load trips</p>
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Trips</h1>
        <p className="text-sm text-muted-foreground">View all your trips and details</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto px-4">
        <Button
          variant={statusFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(undefined)}
        >
          All
        </Button>
        {['New', 'Accepted', 'Loaded', 'In Transit', 'Delivered', 'Paid'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Trips List */}
      <div className="space-y-3 px-4">
        {isLoading ? (
          <>
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </>
        ) : !trips || trips.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No Trips</CardTitle>
              <CardDescription>
                {statusFilter ? 'No trips with this status yet' : 'Start a new trip to see them here'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full">
                Start New Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {trips.map((trip) => (
                <TripCard key={trip.tripId} trip={trip} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
