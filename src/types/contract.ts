/**
 * Contract Types
 * 
 * TypeScript types for contract interactions
 */

import type { Claim, Enrollment } from './claim';

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface ClaimDetails extends Claim {
  enrollment: Enrollment;
  isExpired: boolean;
  daysUntilDeadline: number;
}

export interface EnrollmentDetails extends Enrollment {
  isExpired: boolean;
  daysUntilDeadline: number;
}

export interface ContractConfig {
  appId: number;
  network: 'testnet' | 'localnet';
}
