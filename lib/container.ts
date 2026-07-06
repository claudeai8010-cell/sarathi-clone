import 'server-only';

import { createAIProvider } from '@/lib/ai/ProviderFactory';
import { logger } from '@/lib/logger';
import { brokerRepository } from '@/repositories/BrokerRepository';
import { expenseRepository } from '@/repositories/ExpenseRepository';
import { tripRepository } from '@/repositories/TripRepository';
import { userRepository } from '@/repositories/UserRepository';
import { AIService } from '@/services/AIService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { BrokerService } from '@/services/BrokerService';
import { ExpenseService } from '@/services/ExpenseService';
import { MapsService } from '@/services/MapsService';
import { ProfitabilityService } from '@/services/ProfitabilityService';
import { TripLifecycleService } from '@/services/TripLifecycleService';
import { TripService } from '@/services/TripService';
import { UserService } from '@/services/UserService';

// ============================================================
// Service Container — Composition Root
// Assembles all services with their dependencies exactly once.
// Module-level singletons are safe in Next.js because the
// server process is long-lived and route handlers are not
// re-executed in a new module context per request.
//
// Dependency graph (bottom → top):
//   Repositories
//     → AIProvider, MapsService, ProfitabilityService, LifecycleService
//       → AIService
//         → TripService
//   Repositories → UserService, ExpenseService, AnalyticsService, BrokerService
// ============================================================

const aiProvider = createAIProvider();

const aiService = new AIService(
  aiProvider,
  logger.child({ service: 'AIService' }),
);

const mapsService = new MapsService(
  logger.child({ service: 'MapsService' }),
);

const profitabilityService = new ProfitabilityService(
  logger.child({ service: 'ProfitabilityService' }),
);

const lifecycleService = new TripLifecycleService(
  logger.child({ service: 'TripLifecycleService' }),
);

export const tripService = new TripService(
  tripRepository,
  userRepository,
  aiService,
  mapsService,
  profitabilityService,
  lifecycleService,
  logger.child({ service: 'TripService' }),
);

export const userService = new UserService(
  userRepository,
  logger.child({ service: 'UserService' }),
);

export const expenseService = new ExpenseService(
  expenseRepository,
  tripRepository,
  logger.child({ service: 'ExpenseService' }),
);

export const analyticsService = new AnalyticsService(
  tripRepository,
  expenseRepository,
  logger.child({ service: 'AnalyticsService' }),
);

export const brokerService = new BrokerService(
  brokerRepository,
  logger.child({ service: 'BrokerService' }),
);
