import 'server-only';


import { NotFoundError } from '@/lib/db/errors';
import { BrokerModel } from '@/models/Broker';

import { BaseRepository } from './BaseRepository';

import type {
  CreateBrokerDto,
  IBrokerDocument,
  PaginateOptions,
  PaginatedResult,
  UpdateBrokerDto,
} from '@/types/database';
import type { FilterQuery, Model } from 'mongoose';

export class BrokerRepository extends BaseRepository<
  IBrokerDocument,
  CreateBrokerDto,
  UpdateBrokerDto
> {
  protected readonly model: Model<IBrokerDocument> = BrokerModel;

  async findByBrokerId(brokerId: string): Promise<IBrokerDocument | null> {
    return this.findOne({ brokerId } as FilterQuery<IBrokerDocument>);
  }

  async findByBrokerIdOrThrow(brokerId: string): Promise<IBrokerDocument> {
    const broker = await this.findByBrokerId(brokerId);
    if (!broker) throw new NotFoundError('Broker', brokerId);
    return broker;
  }

  async findByPhone(phone: string): Promise<IBrokerDocument | null> {
    return this.findOne({ phone } as FilterQuery<IBrokerDocument>);
  }

  async findByMinRating(minRating: number): Promise<IBrokerDocument[]> {
    return this.findMany({ rating: { $gte: minRating } } as FilterQuery<IBrokerDocument>);
  }

  async findByMaxPaymentDelay(maxDays: number): Promise<IBrokerDocument[]> {
    return this.findMany({
      averagePaymentDelay: { $lte: maxDays },
    } as FilterQuery<IBrokerDocument>);
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.count({ phone } as FilterQuery<IBrokerDocument>);
    return count > 0;
  }

  async paginateAll(options: PaginateOptions): Promise<PaginatedResult<IBrokerDocument>> {
    return this.paginate({}, options);
  }
}

export const brokerRepository = new BrokerRepository();
