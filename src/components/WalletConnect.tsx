/**
 * WalletConnect Component
 * 
 * Displays wallet connection UI with connect/disconnect functionality
 */

import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { formatAddress } from '../utils/formatters';

export function WalletConnect() {
  const { address, isConnected, connect, disconnect, error } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      await connect();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      await disconnect();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <div className="wallet-connect-section">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {(localError || error) && (
            <div className="error-message">
              {localError || error}
            </div>
          )}
        </div>
      ) : (
        <div className="wallet-connected-section">
          <div className="wallet-info">
            <span className="wallet-label">Connected:</span>
            <span className="wallet-address" title={address || ''}>
              {formatAddress(address || '')}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      )}
    </div>
  );
}
