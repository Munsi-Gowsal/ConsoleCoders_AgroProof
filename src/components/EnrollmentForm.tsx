/**
 * EnrollmentForm Component
 * 
 * Form for farmer enrollment with deadline configuration
 */

import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { contractService } from '../services/contractService';
import { handleTransactionError } from '../utils/errorHandler';

export function EnrollmentForm() {
  const { isConnected } = useWallet();
  const [deadlineDays, setDeadlineDays] = useState<string>('30');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    const days = parseInt(deadlineDays);
    if (isNaN(days) || days <= 0) {
      setError('Deadline must be a positive number');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await contractService.enrollFarmer(days);
      
      if (result.success) {
        setSuccess(`Successfully enrolled! Your claim deadline is ${days} days from now.`);
        setDeadlineDays('30'); // Reset form
      } else {
        setError(result.error || 'Enrollment failed');
      }
    } catch (err) {
      const errorMessage = handleTransactionError(
        err instanceof Error ? err : new Error('Unknown error'),
        'EnrollmentForm'
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="enrollment-form">
        <h2>Farmer Enrollment</h2>
        <p className="info-message">Please connect your wallet to enroll.</p>
      </div>
    );
  }

  return (
    <div className="enrollment-form">
      <h2>Farmer Enrollment</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="deadlineDays">
            Claim Deadline (days from enrollment):
          </label>
          <input
            type="number"
            id="deadlineDays"
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(e.target.value)}
            min="1"
            max="365"
            disabled={isLoading}
            required
          />
          <small>Number of days you have to submit a claim after enrollment</small>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Enrolling...' : 'Enroll'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
}
