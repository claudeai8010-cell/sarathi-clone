import 'server-only';

import type { DailyTotalsDTO, DriverAnalyticsDTO, PeriodSummaryDTO } from '@/dto/AIExtractionDTO';
import type { ILogger } from '@/lib/logger';
import type { ExpenseRepository } from '@/repositories/ExpenseRepository';
import type { TripRepository } from '@/repositories/TripRepository';
import type { ITripDocument } from '@/types/database';

// ============================================================
// AnalyticsService
// Aggregates trip and expense data for reporting.
// No API routes. No chart logic. No business rules.
// Uses repository findMany and aggregates in the service layer.
// ============================================================

function dateToKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function inRange(d: Date, start: Date, end: Date): boolean {
  return d >= start && d <= end;
}

function buildPeriodSummary(
  trips: ITripDocument[],
  totalExpenses: number,
  start: Date,
  end: Date,
): PeriodSummaryDTO {
  const inPeriod = trips.filter((t) => inRange(t.createdAt, start, end));
  const totalRevenue = inPeriod.reduce((s, t) => s + t.grossRevenue, 0);
  const totalProfit = inPeriod.reduce((s, t) => s + t.netProfit, 0);
  const tripCount = inPeriod.length;
  const avgProfit = tripCount > 0 ? totalProfit / tripCount : 0;

  const mostProfitable = inPeriod.reduce<ITripDocument | null>((best, t) => {
    if (!best || t.netProfit > best.netProfit) return t;
    return best;
  }, null);

  return {
    startDate: start,
    endDate: end,
    tripCount,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    averageTripProfit: Math.round(avgProfit * 100) / 100,
    mostProfitableTripId: mostProfitable?.tripId ?? null,
  };
}

export class AnalyticsService {
  constructor(
    private readonly tripRepo: TripRepository,
    private readonly expenseRepo: ExpenseRepository,
    private readonly log: ILogger,
  ) {}

  async getDailyTotals(userId: string, date: Date): Promise<DailyTotalsDTO> {
    this.log.debug('AnalyticsService.getDailyTotals', { userId, date: dateToKey(date) });
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [trips, totalExpenses] = await Promise.all([
      this.tripRepo.findByUser(userId),
      this.expenseRepo.totalAmountByUser(userId),
    ]);

    const dayTrips = trips.filter((t) => inRange(t.createdAt, dayStart, dayEnd));
    return {
      date: dateToKey(date),
      tripCount: dayTrips.length,
      totalRevenue: Math.round(dayTrips.reduce((s, t) => s + t.grossRevenue, 0) * 100) / 100,
      totalProfit: Math.round(dayTrips.reduce((s, t) => s + t.netProfit, 0) * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
    };
  }

  async getWeeklyTotals(userId: string, weekStart: Date): Promise<PeriodSummaryDTO> {
    this.log.debug('AnalyticsService.getWeeklyTotals', { userId, weekStart: dateToKey(weekStart) });
    const start = new Date(weekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const [trips, totalExpenses] = await Promise.all([
      this.tripRepo.findByUser(userId),
      this.expenseRepo.totalAmountByUser(userId),
    ]);
    return buildPeriodSummary(trips, totalExpenses, start, end);
  }

  async getMonthlyTotals(userId: string, year: number, month: number): Promise<PeriodSummaryDTO> {
    this.log.debug('AnalyticsService.getMonthlyTotals', { userId, year, month });
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [trips, totalExpenses] = await Promise.all([
      this.tripRepo.findByUser(userId),
      this.expenseRepo.totalAmountByUser(userId),
    ]);
    return buildPeriodSummary(trips, totalExpenses, start, end);
  }

  async getMostProfitableTrip(userId: string): Promise<string | null> {
    this.log.debug('AnalyticsService.getMostProfitableTrip', { userId });
    const trips = await this.tripRepo.findByUser(userId);
    if (trips.length === 0) return null;
    const best = trips.reduce((a, b) => (a.netProfit > b.netProfit ? a : b));
    return best.tripId;
  }

  async getAverageTripProfit(userId: string): Promise<number> {
    this.log.debug('AnalyticsService.getAverageTripProfit', { userId });
    const trips = await this.tripRepo.findByUser(userId);
    if (trips.length === 0) return 0;
    const total = trips.reduce((s, t) => s + t.netProfit, 0);
    return Math.round((total / trips.length) * 100) / 100;
  }

  async getDriverAnalytics(userId: string): Promise<DriverAnalyticsDTO> {
    this.log.info('AnalyticsService.getDriverAnalytics: start', { userId });
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const [daily, weekly, monthly] = await Promise.all([
      this.getDailyTotals(userId, now),
      this.getWeeklyTotals(userId, weekStart),
      this.getMonthlyTotals(userId, now.getFullYear(), now.getMonth() + 1),
    ]);

    this.log.info('AnalyticsService.getDriverAnalytics: complete', { userId });
    return { userId, daily: [daily], weekly, monthly };
  }
}
