/**
 * ClaimSubmission Component
 * 
 * Form for submitting crop damage claims with proof hash
 */

import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { contractService } from '../services/contractService';
import { handleTransactionError } from '../utils/errorHandler';
import { isDeadlinePassed, formatDeadline } from '../utils/formatters';

export function ClaimSubmission() {
  const { address, isConnected } = useWallet();
  const [proofHash, setProofHash] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkEnrollment();
    }
  }, [isConnected, address]);

  const checkEnrollment = async () => {
    if (!address) return;
    
    setCheckingEnrollment(true);
    try {
      const enrollmentData = await contractService.getEnrollment(address);
      setEnrollment(enrollmentData);
    } catch (err) {
      console.error('Failed to check enrollment:', err);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!enrollment) {
      setError('You must enroll before submitting a claim');
      return;
    }

    if (isDeadlinePassed(enrollment.claimDeadline)) {
      setError('Your claim deadline has expired');
      return;
    }

    if (!proofHash.trim()) {
      setError('Proof hash cannot be empty');
      return;
    }

    if (proofHash.length > 256) {
      setError('Proof hash is too long (max 256 characters)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await contractService.submitClaim(proofHash);
      
      if (result.success) {
        setSuccess('Claim submitted successfully! Your claim is now pending verification.');
        setProofHash(''); // Reset form
      } else {
        setError(result.error || 'Claim submission failed');
      }
    } catch (err) {
      const errorMessage = handleTransactionError(
        err instanceof Error ? err : new Error('Unknown error'),
        'ClaimSubmission'
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="claim-submission">
        <h2>Submit Claim</h2>
        <p className="info-message">Please connect your wallet to submit a claim.</p>
      </div>
    );
  }

  if (checkingEnrollment) {
    return (
      <div className="claim-submission">
        <h2>Submit Claim</h2>
        <p className="info-message">Checking enrollment status...</p>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="claim-submission">
        <h2>Submit Claim</h2>
        <p className="warning-message">
          You must enroll before submitting a claim. Please use the enrollment form above.
        </p>
      </div>
    );
  }

  const deadlineStatus = formatDeadline(enrollment.claimDeadline);
  const expired = isDeadlinePassed(enrollment.claimDeadline);

  return (
    <div className="claim-submission">
      <h2>Submit Claim</h2>
      
      <div className="enrollment-status">
        <p>
          <strong>Deadline Status:</strong>{' '}
          <span className={expired ? 'status-expired' : 'status-active'}>
            {deadlineStatus}
          </span>
        </p>
      </div>

      {expired ? (
        <p className="warning-message">
          Your claim deadline has expired. You can no longer submit claims.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="proofHash">
              Proof Hash:
            </label>
            <input
              type="text"
              id="proofHash"
              value={proofHash}
              onChange={(e) => setProofHash(e.target.value)}
              placeholder="Enter cryptographic hash of damage evidence"
              disabled={isLoading}
              required
            />
            <small>
              Cryptographic hash representing evidence of crop damage (e.g., SHA-256 hash of photos/documents)
            </small>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </form>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
}
