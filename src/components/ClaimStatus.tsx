/**
 * ClaimStatus Component
 * 
 * Displays detailed status information for a farmer's claim
 */

import { useEffect, useState } from 'react';
import { contractService } from '../services/contractService';
import type { Claim, Enrollment } from '../types/claim';
import { 
  formatTimestamp, 
  formatAddress, 
  formatClaimStatus, 
  getStatusColor,
  formatDeadline,
  calculateDaysUntilDeadline,
  isDeadlinePassed,
  formatProofHash
} from '../utils/formatters';

interface ClaimStatusProps {
  farmerAddress: string;
}

export function ClaimStatus({ farmerAddress }: ClaimStatusProps) {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClaimData();
  }, [farmerAddress]);

  async function loadClaimData() {
    try {
      setLoading(true);
      setError(null);

      const [claimData, enrollmentData] = await Promise.all([
        contractService.getClaim(farmerAddress),
        contractService.getEnrollment(farmerAddress)
      ]);

      setClaim(claimData);
      setEnrollment(enrollmentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load claim data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="claim-status loading">
        <p>Loading claim status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="claim-status error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="claim-status no-claim">
        <p>No claim found for this farmer.</p>
      </div>
    );
  }

  const statusColor = getStatusColor(claim.status);
  const isExpired = enrollment ? isDeadlinePassed(enrollment.claimDeadline) : false;
  const daysUntilDeadline = enrollment ? calculateDaysUntilDeadline(enrollment.claimDeadline) : 0;

  return (
    <div className="claim-status">
      <h2>Claim Status</h2>
      
      <div className="status-section">
        <div className="status-badge" style={{ backgroundColor: statusColor }}>
          {formatClaimStatus(claim.status)}
        </div>
      </div>

      <div className="claim-details">
        <div className="detail-row">
          <span className="label">Farmer Address:</span>
          <span className="value" title={claim.farmerAddress}>
            {formatAddress(claim.farmerAddress, 8)}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Proof Hash:</span>
          <span className="value" title={claim.proofHash}>
            {formatProofHash(claim.proofHash, 40)}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Submission Time:</span>
          <span className="value">{formatTimestamp(claim.submissionTimestamp)}</span>
        </div>

        {claim.verifierAddress && (
          <div className="detail-row">
            <span className="label">Verifier:</span>
            <span className="value" title={claim.verifierAddress}>
              {formatAddress(claim.verifierAddress, 8)}
            </span>
          </div>
        )}

        {claim.verificationTimestamp && (
          <div className="detail-row">
            <span className="label">Verification Time:</span>
            <span className="value">{formatTimestamp(claim.verificationTimestamp)}</span>
          </div>
        )}
      </div>

      {enrollment && (
        <div className="enrollment-details">
          <h3>Enrollment Information</h3>
          
          <div className="detail-row">
            <span className="label">Enrollment Time:</span>
            <span className="value">{formatTimestamp(enrollment.enrollmentTimestamp)}</span>
          </div>

          <div className="detail-row">
            <span className="label">Claim Deadline:</span>
            <span className="value">{formatTimestamp(enrollment.claimDeadline)}</span>
          </div>

          <div className="detail-row">
            <span className="label">Deadline Status:</span>
            <span className={`value ${isExpired ? 'expired' : 'active'}`}>
              {isExpired ? 'Expired' : formatDeadline(enrollment.claimDeadline)}
            </span>
          </div>

          {!isExpired && (
            <div className="detail-row">
              <span className="label">Days Remaining:</span>
              <span className="value">{daysUntilDeadline}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
