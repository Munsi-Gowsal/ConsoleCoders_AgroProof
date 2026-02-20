/**
 * VerifierManagement Component
 * 
 * Interface for admin to add and remove authorized verifiers
 */

import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { contractService } from '../services/contractService';
import { handleTransactionError } from '../utils/errorHandler';
import { formatAddress, isValidAlgorandAddress } from '../utils/formatters';

export function VerifierManagement() {
  const { address, isConnected } = useWallet();
  const [verifierAddress, setVerifierAddress] = useState<string>('');
  const [verifiers, setVerifiers] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [loadingVerifiers, setLoadingVerifiers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingAddress, setProcessingAddress] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      checkAdminStatus();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isAdmin) {
      loadVerifiers();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!address) return;
    
    setCheckingAdmin(true);
    try {
      const adminAddress = await contractService.getAdmin();
      setIsAdmin(adminAddress === address);
    } catch (err) {
      console.error('Failed to check admin status:', err);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const loadVerifiers = async () => {
    setLoadingVerifiers(true);
    setError(null);
    
    try {
      // Get all verifiers from the contract
      // Note: This is a placeholder - actual implementation depends on contract ABI
      // For now, we'll show an empty list and populate it as verifiers are added
      setVerifiers([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load verifiers';
      setError(errorMessage);
    } finally {
      setLoadingVerifiers(false);
    }
  };

  const handleAddVerifier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isAdmin) {
      setError('Only the admin can add verifiers');
      return;
    }

    if (!verifierAddress.trim()) {
      setError('Verifier address cannot be empty');
      return;
    }

    if (!isValidAlgorandAddress(verifierAddress)) {
      setError('Invalid Algorand address format. Address must be 58 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await contractService.addVerifier(verifierAddress);
      
      if (result.success) {
        setSuccess(`Verifier ${formatAddress(verifierAddress)} added successfully!`);
        setVerifierAddress(''); // Reset form
        
        // Add to local list
        setVerifiers(prev => [...prev, verifierAddress]);
      } else {
        setError(result.error || 'Failed to add verifier');
      }
    } catch (err) {
      const errorMessage = handleTransactionError(
        err instanceof Error ? err : new Error('Unknown error'),
        'VerifierManagement.addVerifier'
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVerifier = async (addressToRemove: string) => {
    if (!isAdmin) {
      setError('Only the admin can remove verifiers');
      return;
    }

    setProcessingAddress(addressToRemove);
    setError(null);
    setSuccess(null);

    try {
      const result = await contractService.removeVerifier(addressToRemove);
      
      if (result.success) {
        setSuccess(`Verifier ${formatAddress(addressToRemove)} removed successfully!`);
        
        // Remove from local list
        setVerifiers(prev => prev.filter(addr => addr !== addressToRemove));
      } else {
        setError(result.error || 'Failed to remove verifier');
      }
    } catch (err) {
      const errorMessage = handleTransactionError(
        err instanceof Error ? err : new Error('Unknown error'),
        'VerifierManagement.removeVerifier'
      );
      setError(errorMessage);
    } finally {
      setProcessingAddress(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="verifier-management">
        <h2>Verifier Management</h2>
        <p className="info-message">Please connect your wallet to manage verifiers.</p>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="verifier-management">
        <h2>Verifier Management</h2>
        <p className="info-message">Checking admin status...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="verifier-management">
        <h2>Verifier Management</h2>
        <p className="warning-message">
          You are not authorized to manage verifiers. Only the admin can access this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="verifier-management">
      <h2>Verifier Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleAddVerifier}>
        <div className="form-group">
          <label htmlFor="verifierAddress">
            Add Verifier Address:
          </label>
          <input
            type="text"
            id="verifierAddress"
            value={verifierAddress}
            onChange={(e) => setVerifierAddress(e.target.value)}
            placeholder="Enter Algorand address (58 characters)"
            disabled={isLoading}
            maxLength={58}
            required
          />
          <small>
            Algorand address of the verifier to authorize (must be exactly 58 characters)
          </small>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Adding...' : 'Add Verifier'}
        </button>
      </form>

      <div className="verifiers-section">
        <h3>Authorized Verifiers</h3>
        
        {loadingVerifiers ? (
          <p className="info-message">Loading verifiers...</p>
        ) : verifiers.length === 0 ? (
          <p className="info-message">No verifiers have been added yet.</p>
        ) : (
          <div className="verifiers-list">
            {verifiers.map((addr) => (
              <div key={addr} className="verifier-item">
                <div className="verifier-address">
                  <span className="address-full">{addr}</span>
                  <span className="address-short">{formatAddress(addr)}</span>
                </div>
                
                <button
                  onClick={() => handleRemoveVerifier(addr)}
                  disabled={processingAddress === addr}
                  className="btn btn-danger btn-small"
                >
                  {processingAddress === addr ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
