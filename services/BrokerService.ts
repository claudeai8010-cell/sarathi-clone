import 'server-only';

import { NotFoundError } from '@/lib/db/errors';

import type { BrokerSummaryDTO, CreateBrokerDTO, UpdateBrokerDTO } from '@/dto/BrokerDTO';
import type { ILogger } from '@/lib/logger';
import type { BrokerRepository } from '@/repositories/BrokerRepository';
import type { IBrokerDocument } from '@/types/database';

// ============================================================
// BrokerService
// Broker directory management. Never exposes Mongoose documents.
// All output is BrokerSummaryDTO.
// ============================================================

function toBrokerSummary(doc: IBrokerDocument): BrokerSummaryDTO {
  return {
    brokerId: doc.brokerId,
    mongoId: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    company: doc.company,
    averagePaymentDelay: doc.averagePaymentDelay,
    rating: doc.rating,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class BrokerService {
  constructor(
    private readonly brokerRepo: BrokerRepository,
    private readonly log: ILogger,
  ) {}

  async createBroker(dto: CreateBrokerDTO): Promise<BrokerSummaryDTO> {
    this.log.info('BrokerService.createBroker: start', { brokerId: dto.brokerId });
    const doc = await this.brokerRepo.create({
      brokerId: dto.brokerId,
      name: dto.name,
      phone: dto.phone,
      company: dto.company ?? '',
      averagePaymentDelay: dto.averagePaymentDelay ?? 0,
      rating: dto.rating ?? 3,
      notes: dto.notes ?? '',
    });
    this.log.info('BrokerService.createBroker: complete', { brokerId: doc.brokerId });
    return toBrokerSummary(doc);
  }

  async getBrokerById(brokerId: string): Promise<BrokerSummaryDTO> {
    this.log.debug('BrokerService.getBrokerById', { brokerId });
    const doc = await this.brokerRepo.findByBrokerIdOrThrow(brokerId);
    return toBrokerSummary(doc);
  }

  async updateBroker(brokerId: string, dto: UpdateBrokerDTO): Promise<BrokerSummaryDTO> {
    this.log.info('BrokerService.updateBroker: start', { brokerId });
    const existing = await this.brokerRepo.findByBrokerId(brokerId);
    if (!existing) throw new NotFoundError('Broker', brokerId);
    const updated = await this.brokerRepo.update(existing._id.toString(), dto);
    if (!updated) throw new NotFoundError('Broker', brokerId);
    this.log.info('BrokerService.updateBroker: complete', { brokerId });
    return toBrokerSummary(updated);
  }

  async deleteBroker(brokerId: string): Promise<void> {
    this.log.info('BrokerService.deleteBroker', { brokerId });
    const existing = await this.brokerRepo.findByBrokerId(brokerId);
    if (!existing) throw new NotFoundError('Broker', brokerId);
    await this.brokerRepo.delete(existing._id.toString());
  }

  async listBrokers(): Promise<BrokerSummaryDTO[]> {
    this.log.debug('BrokerService.listBrokers');
    const docs = await this.brokerRepo.findMany();
    return docs.map(toBrokerSummary);
  }
}
