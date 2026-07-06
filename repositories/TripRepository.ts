import 'server-only';


import { NotFoundError } from '@/lib/db/errors';
import { TripModel } from '@/models/Trip';

import { BaseRepository } from './BaseRepository';

import type {
  CreateTripDto,
  ITripDocument,
  PaginateOptions,
  PaginatedResult,
  SyncStatus,
  TripStatus,
  UpdateTripDto,
} from '@/types/database';
import type { FilterQuery, Model, Types } from 'mongoose';

export class TripRepository extends BaseRepository<ITripDocument, CreateTripDto, UpdateTripDto> {
  protected readonly model: Model<ITripDocument> = TripModel;

  async findByTripId(tripId: string): Promise<ITripDocument | null> {
    return this.findOne({ tripId } as FilterQuery<ITripDocument>);
  }

  async findByTripIdOrThrow(tripId: string): Promise<ITripDocument> {
    const trip = await this.findByTripId(tripId);
    if (!trip) throw new NotFoundError('Trip', tripId);
    return trip;
  }

  async findByUser(userId: Types.ObjectId | string): Promise<ITripDocument[]> {
    return this.findMany({ user: userId } as FilterQuery<ITripDocument>);
  }

  async findByUserAndStatus(
    userId: Types.ObjectId | string,
    status: TripStatus,
  ): Promise<ITripDocument[]> {
    return this.findMany({ user: userId, status } as FilterQuery<ITripDocument>);
  }

  async findBySyncStatus(syncStatus: SyncStatus): Promise<ITripDocument[]> {
    return this.findMany({ syncStatus } as FilterQuery<ITripDocument>);
  }

  async paginateByUser(
    userId: Types.ObjectId | string,
    options: PaginateOptions,
  ): Promise<PaginatedResult<ITripDocument>> {
    return this.paginate({ user: userId } as FilterQuery<ITripDocument>, options);
  }

  async countByUser(userId: Types.ObjectId | string): Promise<number> {
    return this.count({ user: userId } as FilterQuery<ITripDocument>);
  }

  async countByStatus(status: TripStatus): Promise<number> {
    return this.count({ status } as FilterQuery<ITripDocument>);
  }
}

export const tripRepository = new TripRepository();
