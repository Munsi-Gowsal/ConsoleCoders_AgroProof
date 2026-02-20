/**
 * ClaimVerification Component
 * 
 * Interface for verifiers to approve or reject pending claims
 */

import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { contractService } from '../services/contractService';
import { handleTransactionError } from '../utils/errorHandler';
import { formatAddress, formatTimestamp } from '../utils/formatters';
import { ClaimStatus } from '../types/claim';
import type { Claim } from '../types/claim';

export function ClaimVerification() {
  const { address, isConnected } = useWallet();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isVerifier, setIsVerifier] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingVerifier, setCheckingVerifier] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingClaim, setProcessingClaim] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      checkVerifierStatus();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isVerifier) {
      loadPendingClaims();
    }
  }, [isVerifier]);

  const checkVerifierStatus = async () => {
    if (!address) return;
    
    setCheckingVerifier(true);
    try {
      const verifierStatus = await contractService.isVerifier(address);
      setIsVerifier(verifierStatus);
    } catch (err) {
      console.error('Failed to check verifier status:', err);
      setIsVerifier(false);
    } finally {
      setCheckingVerifier(false);
    }
  };

  const loadPendingClaims = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allClaims = await contractService.getAllClaims();
      
      // Filter to show only pending claims
      const pendingClaims = allClaims.filter(
        claim => claim.status === ClaimStatus.PENDING
      );
      
      setClaims(pendingClaims);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load claims';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyClaim = async (farmerAddress: string, approved: boolean) => {
    setProcessingClaim(farmerAddress);
    setError(null);
    setSuccess(null);

    try {
      const result = await contractService.verifyClaim(farmerAddress, approved);
      
      if (result.success) {
        const action = approved ? 'approved' : 'rejected';
        setSuccess(`Claim ${action} successfully!`);
        
        // Refresh the claim list
        await loadPendingClaims();
      } else {
        setError(result.error || 'Claim verification failed');
      }
    } catch (err) {
      const errorMessage = handleTransactionError(
        err instanceof Error ? err : new Error('Unknown error'),
        'ClaimVerification'
      );
      setError(errorMessage);
    } finally {
      setProcessingClaim(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="claim-verification">
        <h2>Claim Verification</h2>
        <p className="info-message">Please connect your wallet to verify claims.</p>
      </div>
    );
  }

  if (checkingVerifier) {
    return (
      <div className="claim-verification">
        <h2>Claim Verification</h2>
        <p className="info-message">Checking verifier status...</p>
      </div>
    );
  }

  if (!isVerifier) {
    return (
      <div className="claim-verification">
        <h2>Claim Verification</h2>
        <p className="warning-message">
          You are not authorized to verify claims. Only authorized verifiers can access this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="claim-verification">
      <h2>Claim Verification</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isLoading ? (
        <p className="info-message">Loading pending claims...</p>
      ) : claims.length === 0 ? (
        <p className="info-message">No pending claims to verify.</p>
      ) : (
        <div className="claims-list">
          <p className="claims-count">
            <strong>{claims.length}</strong> pending claim{claims.length !== 1 ? 's' : ''}
          </p>
          
          {claims.map((claim) => (
            <div key={claim.farmerAddress} className="claim-card">
              <div className="claim-details">
                <div className="claim-field">
                  <strong>Farmer Address:</strong>
                  <span className="address">{formatAddress(claim.farmerAddress)}</span>
                </div>
                
                <div className="claim-field">
                  <strong>Proof Hash:</strong>
                  <span className="proof-hash">{claim.proofHash}</span>
                </div>
                
                <div className="claim-field">
                  <strong>Submitted:</strong>
                  <span>{formatTimestamp(claim.submissionTimestamp)}</span>
                </div>
                
                <div className="claim-field">
                  <strong>Status:</strong>
                  <span className="status-pending">{claim.status}</span>
                </div>
              </div>

              <div className="claim-actions">
                <button
                  onClick={() => handleVerifyClaim(claim.farmerAddress, true)}
                  disabled={processingClaim === claim.farmerAddress}
                  className="btn btn-success"
                >
                  {processingClaim === claim.farmerAddress ? 'Processing...' : 'Approve'}
                </button>
                
                <button
                  onClick={() => handleVerifyClaim(claim.farmerAddress, false)}
                  disabled={processingClaim === claim.farmerAddress}
                  className="btn btn-danger"
                >
                  {processingClaim === claim.farmerAddress ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
