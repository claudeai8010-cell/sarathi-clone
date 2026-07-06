'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store';

import type { ApiResponse } from '@/types/api';
import type {
  DailyTotalsDTO,
  ExpenseSummaryDTO,
  PeriodSummaryDTO,
  TripSummaryDTO,
  UserSummaryDTO,
} from '@/dto';

// ============================================================
// React Query Hooks
// All hooks automatically include JWT token from Zustand auth store.
// API routes handle authorization, return ApiResponse<T> envelope.
// Hooks unwrap the envelope and return the inner data or throw error.
// ============================================================

async function apiCall<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: HeadersInit = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    const errorMsg = json.error?.message || 'API error';
    throw new Error(errorMsg);
  }

  if (!json.success) {
    throw new Error(json.error?.message || 'Request failed');
  }

  if (!json.data) {
    throw new Error('No data in response');
  }

  return json.data;
}

// ============================================================
// Queries (GET)
// ============================================================

/**
 * Fetch daily analytics (revenue, expenses, profit, trip count)
 * for a specific date (defaults to today).
 */
export function useDailyAnalytics(date?: Date) {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: ['analytics', 'daily', date?.toISOString().split('T')[0]],
    queryFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      const params = new URLSearchParams();
      if (date) {
        params.set('date', date.toISOString().split('T')[0]);
      }
      return apiCall<DailyTotalsDTO>(`/v1/analytics/daily?${params.toString()}`);
    },
    enabled: !!userId,
  });
}

/**
 * Fetch weekly/period analytics (trip count, revenue, profit, average profit).
 */
export function useWeeklyAnalytics(startDate: Date, endDate: Date) {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: [
      'analytics',
      'weekly',
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
    ],
    queryFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      const params = new URLSearchParams();
      params.set('startDate', startDate.toISOString().split('T')[0]);
      params.set('endDate', endDate.toISOString().split('T')[0]);
      return apiCall<PeriodSummaryDTO>(`/v1/analytics/weekly?${params.toString()}`);
    },
    enabled: !!userId,
  });
}

/**
 * Fetch all trips for the current driver.
 * Supports filtering by status, date range, pagination, sort order.
 */
export function useTrips(options?: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
}) {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: ['trips', userId, options?.status, options?.page, options?.limit],
    queryFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      const params = new URLSearchParams();
      params.set('userId', userId);
      if (options?.status) params.set('status', options.status);
      if (options?.startDate)
        params.set('startDate', options.startDate.toISOString().split('T')[0]);
      if (options?.endDate) params.set('endDate', options.endDate.toISOString().split('T')[0]);
      params.set('page', String(options?.page ?? 1));
      params.set('limit', String(options?.limit ?? 20));
      params.set('sort', options?.sort ?? 'desc');
      return apiCall<TripSummaryDTO[]>(`/v1/trips?${params.toString()}`);
    },
    enabled: !!userId,
  });
}

/**
 * Fetch all expenses for the current driver (or filtered by tripId).
 */
export function useExpenses(options?: { tripId?: string }) {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: ['expenses', userId, options?.tripId],
    queryFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      const params = new URLSearchParams();
      if (options?.tripId) {
        params.set('tripId', options.tripId);
      } else {
        params.set('userId', userId);
      }
      return apiCall<ExpenseSummaryDTO[]>(`/v1/expenses?${params.toString()}`);
    },
    enabled: !!userId,
  });
}

/**
 * Fetch the current driver's profile (name, vehicle, fuel type, base mileage).
 */
export function useUserProfile() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      return apiCall<UserSummaryDTO>(`/v1/users/${userId}`);
    },
    enabled: !!userId,
  });
}

// ============================================================
// Mutations (POST, PUT, etc.)
// ============================================================

/**
 * Create a new expense.
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: async (payload: {
      expenseId?: string;
      tripId?: string;
      category: string;
      amount: number;
      notes?: string;
      receiptImageUrl?: string;
    }) => {
      if (!userId) throw new Error('Not authenticated');
      return apiCall<ExpenseSummaryDTO>('/v1/expenses', {
        method: 'POST',
        body: JSON.stringify({
          expenseId: payload.expenseId,
          userId,
          tripId: payload.tripId,
          category: payload.category,
          amount: payload.amount,
          notes: payload.notes,
          receiptImageUrl: payload.receiptImageUrl,
        }),
      });
    },
    onSuccess: () => {
      // Invalidate expenses query so it refetches
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // Also invalidate analytics since expenses affect profit
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Create a new trip from parsed data.
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: async (payload: {
      tripId: string;
      parsed: {
        pickupLocation: string;
        dropLocation: string;
        payloadKg: number;
        grossRevenue: number;
        estimatedFuelCost: number;
        estimatedToll: number;
      };
      confidence: number;
    }) => {
      if (!userId) throw new Error('Not authenticated');
      return apiCall<TripSummaryDTO>('/v1/trips', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          ...payload,
        }),
      });
    },
    onSuccess: () => {
      // Invalidate trips and analytics queries
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
