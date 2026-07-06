import 'server-only';


import { NotFoundError } from '@/lib/db/errors';
import { UserModel } from '@/models/User';

import { BaseRepository } from './BaseRepository';

import type {
  CreateUserDto,
  IUserDocument,
  PaginateOptions,
  PaginatedResult,
  UpdateUserDto,
} from '@/types/database';
import type { FilterQuery, Model } from 'mongoose';

export class UserRepository extends BaseRepository<IUserDocument, CreateUserDto, UpdateUserDto> {
  protected readonly model: Model<IUserDocument> = UserModel;

  async findByUserId(userId: string): Promise<IUserDocument | null> {
    return this.findOne({ userId } as FilterQuery<IUserDocument>);
  }

  async findByPhone(phone: string): Promise<IUserDocument | null> {
    return this.findOne({ phone } as FilterQuery<IUserDocument>);
  }

  async findByUserIdOrThrow(userId: string): Promise<IUserDocument> {
    const user = await this.findByUserId(userId);
    if (!user) throw new NotFoundError('User', userId);
    return user;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.count({ phone } as FilterQuery<IUserDocument>);
    return count > 0;
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.count({ userId } as FilterQuery<IUserDocument>);
    return count > 0;
  }

  async paginateAll(options: PaginateOptions): Promise<PaginatedResult<IUserDocument>> {
    return this.paginate({}, options);
  }
}

export const userRepository = new UserRepository();
