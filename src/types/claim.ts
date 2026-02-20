/**
 * Claim Types
 * 
 * TypeScript types for claim data structures
 */

export const ClaimStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export type ClaimStatus = typeof ClaimStatus[keyof typeof ClaimStatus];

export interface Claim {
  farmerAddress: string;
  proofHash: string;
  status: ClaimStatus;
  submissionTimestamp: number;
  verifierAddress: string | null;
  verificationTimestamp: number | null;
}

export interface Enrollment {
  farmerAddress: string;
  enrollmentTimestamp: number;
  claimDeadline: number;
}
