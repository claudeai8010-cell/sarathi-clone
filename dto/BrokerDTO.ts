import 'server-only';

// ============================================================
// Broker DTOs
// Services exchange these — never raw Mongoose documents.
// All output is BrokerSummaryDTO.
// ============================================================

export interface CreateBrokerDTO {
  readonly brokerId: string;
  readonly name: string;
  readonly phone: string;
  readonly company?: string;
  readonly averagePaymentDelay?: number;
  readonly rating?: number;
  readonly notes?: string;
}

export interface UpdateBrokerDTO {
  readonly name?: string;
  readonly phone?: string;
  readonly company?: string;
  readonly averagePaymentDelay?: number;
  readonly rating?: number;
  readonly notes?: string;
}

export interface BrokerSummaryDTO {
  readonly brokerId: string;
  readonly mongoId: string;
  readonly name: string;
  readonly phone: string;
  readonly company: string;
  readonly averagePaymentDelay: number;
  readonly rating: number;
  readonly notes: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
