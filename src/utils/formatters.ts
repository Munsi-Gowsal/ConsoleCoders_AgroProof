/**
 * Data Formatter Utility
 * 
 * Functions for formatting timestamps, addresses, and claim status
 */

import { ClaimStatus } from '../types/claim';

/**
 * Format Unix timestamp to readable date string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format Algorand address for display (truncated)
 */
export function formatAddress(address: string, chars: number = 6): string {
  if (!address || address.length < chars * 2) {
    return address;
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format claim status for display
 */
export function formatClaimStatus(status: ClaimStatus): string {
  switch (status) {
    case ClaimStatus.PENDING:
      return 'Pending';
    case ClaimStatus.APPROVED:
      return 'Approved';
    case ClaimStatus.REJECTED:
      return 'Rejected';
    default:
      return 'Unknown';
  }
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: ClaimStatus): string {
  switch (status) {
    case ClaimStatus.PENDING:
      return '#f59e0b'; // yellow
    case ClaimStatus.APPROVED:
      return '#10b981'; // green
    case ClaimStatus.REJECTED:
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Calculate days until deadline
 */
export function calculateDaysUntilDeadline(deadlineTimestamp: number): number {
  const now = Math.floor(Date.now() / 1000);
  const secondsRemaining = deadlineTimestamp - now;
  return Math.ceil(secondsRemaining / 86400); // 86400 seconds per day
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadlineTimestamp: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= deadlineTimestamp;
}

/**
 * Format deadline display
 */
export function formatDeadline(deadlineTimestamp: number): string {
  if (isDeadlinePassed(deadlineTimestamp)) {
    return 'Expired';
  }
  
  const days = calculateDaysUntilDeadline(deadlineTimestamp);
  
  if (days === 0) {
    return 'Expires today';
  } else if (days === 1) {
    return '1 day remaining';
  } else {
    return `${days} days remaining`;
  }
}

/**
 * Validate Algorand address format
 */
export function isValidAlgorandAddress(address: string): boolean {
  // Algorand addresses are 58 characters long
  if (address.length !== 58) {
    return false;
  }
  
  // Check if it contains only valid base32 characters
  const base32Regex = /^[A-Z2-7]+$/;
  return base32Regex.test(address);
}

/**
 * Format proof hash for display
 */
export function formatProofHash(hash: string, maxLength: number = 32): string {
  if (hash.length <= maxLength) {
    return hash;
  }
  return `${hash.slice(0, maxLength)}...`;
}
