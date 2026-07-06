import 'server-only';


import { mapMongooseError } from '@/lib/db/errors';
import { connectDB } from '@/lib/db/mongoose';

import type { PaginateOptions, PaginatedResult, SoftDeletable } from '@/types/database';
import type { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';

// ============================================================
// BASE REPOSITORY
// All concrete repositories extend this class.
// TDocument — Mongoose document type (extends Document & SoftDeletable)
// TCreate   — DTO used for creation
// TUpdate   — DTO used for partial updates
// ============================================================

export abstract class BaseRepository<
  TDocument extends Document & SoftDeletable,
  TCreate,
  TUpdate,
> {
  protected abstract readonly model: Model<TDocument>;

  // All read operations automatically exclude soft-deleted documents.
  private get softDeleteFilter(): FilterQuery<TDocument> {
    return { deletedAt: null } as FilterQuery<TDocument>;
  }

  private mergeFilter(filter: FilterQuery<TDocument>): FilterQuery<TDocument> {
    return { ...this.softDeleteFilter, ...filter };
  }

  protected async ensureConnected(): Promise<void> {
    await connectDB();
  }

  // ── CREATE ──────────────────────────────────────────────────

  async create(data: TCreate): Promise<TDocument> {
    await this.ensureConnected();
    try {
      const doc = await this.model.create(data as Partial<TDocument>);
      return doc;
    } catch (err) {
      throw mapMongooseError(err);
    }
  }

  // ── READ ────────────────────────────────────────────────────

  async findById(id: string): Promise<TDocument | null> {
    await this.ensureConnected();
    return this.model.findOne(this.mergeFilter({ _id: id } as FilterQuery<TDocument>)).exec();
  }

  async findOne(filter: FilterQuery<TDocument>): Promise<TDocument | null> {
    await this.ensureConnected();
    return this.model.findOne(this.mergeFilter(filter)).exec();
  }

  async findMany(filter: FilterQuery<TDocument> = {}): Promise<TDocument[]> {
    await this.ensureConnected();
    return this.model.find(this.mergeFilter(filter)).exec();
  }

  // ── UPDATE ──────────────────────────────────────────────────

  async update(id: string, data: TUpdate): Promise<TDocument | null> {
    await this.ensureConnected();
    try {
      return await this.model
        .findOneAndUpdate(
          this.mergeFilter({ _id: id } as FilterQuery<TDocument>),
          { $set: data } as UpdateQuery<TDocument>,
          { new: true, runValidators: true },
        )
        .exec();
    } catch (err) {
      throw mapMongooseError(err);
    }
  }

  // ── SOFT DELETE ─────────────────────────────────────────────
  // Sets deletedAt timestamp. The record is retained in the DB.
  // Pass includeDeleted: true to subsequent queries to recover.

  async delete(id: string): Promise<boolean> {
    await this.ensureConnected();
    const result = await this.model
      .findOneAndUpdate(
        this.mergeFilter({ _id: id } as FilterQuery<TDocument>),
        { $set: { deletedAt: new Date() } } as UpdateQuery<TDocument>,
        { new: true },
      )
      .exec();
    return result !== null;
  }

  // ── COUNT ───────────────────────────────────────────────────

  async count(filter: FilterQuery<TDocument> = {}): Promise<number> {
    await this.ensureConnected();
    return this.model.countDocuments(this.mergeFilter(filter)).exec();
  }

  // ── PAGINATE ────────────────────────────────────────────────

  async paginate(
    filter: FilterQuery<TDocument> = {},
    options: PaginateOptions,
  ): Promise<PaginatedResult<TDocument>> {
    await this.ensureConnected();
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const combined = this.mergeFilter(filter);

    const [data, total] = await Promise.all([
      this.model
        .find(combined)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(combined).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
