/**
 * Error Handler Utility
 * 
 * Parses contract errors and provides user-friendly messages
 */

const ERROR_MAP: Record<string, string> = {
  'ERR_ALREADY_ENROLLED': 'You are already enrolled in the system.',
  'ERR_INVALID_DEADLINE': 'Deadline must be greater than zero days.',
  'ERR_NOT_ENROLLED': 'Please enroll before submitting a claim.',
  'ERR_DEADLINE_PASSED': 'Your claim deadline has expired.',
  'ERR_DUPLICATE_CLAIM': 'You have already submitted a claim.',
  'ERR_INVALID_PROOF_HASH': 'Proof hash cannot be empty.',
  'ERR_NOT_VERIFIER': 'You are not authorized to verify claims.',
  'ERR_CLAIM_NOT_FOUND': 'Claim not found for this farmer.',
  'ERR_CLAIM_NOT_PENDING': 'This claim has already been verified.',
  'ERR_NOT_ADMIN': 'Only the admin can perform this action.',
  'ERR_VERIFIER_EXISTS': 'This verifier is already authorized.',
  'ERR_VERIFIER_NOT_FOUND': 'Verifier not found in authorized list.',
  'ERR_ENROLLMENT_NOT_FOUND': 'Enrollment not found for this farmer.'
};

/**
 * Parse contract error and return user-friendly message
 */
export function parseContractError(error: Error): string {
  const errorMessage = error.message;

  // Check for contract error codes
  for (const [code, message] of Object.entries(ERROR_MAP)) {
    if (errorMessage.includes(code)) {
      return message;
    }
  }

  // Check for Algorand-specific errors
  if (errorMessage.includes('insufficient balance') || errorMessage.includes('below min')) {
    return 'Insufficient ALGO balance to complete this transaction. Please add funds to your wallet.';
  }

  if (errorMessage.includes('rejected') || errorMessage.includes('cancelled')) {
    return 'Transaction was cancelled.';
  }

  if (errorMessage.includes('invalid address')) {
    return 'Invalid Algorand address format.';
  }

  if (errorMessage.includes('application does not exist')) {
    return 'Smart contract not found. Please check the contract configuration.';
  }

  if (errorMessage.includes('logic eval error')) {
    return 'Transaction failed validation. Please check your inputs and try again.';
  }

  // Default error message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with context
 */
export function logError(error: Error, context: string): void {
  console.error(`Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle transaction error with logging and user message
 */
export function handleTransactionError(error: Error, context: string): string {
  logError(error, context);
  return parseContractError(error);
}
