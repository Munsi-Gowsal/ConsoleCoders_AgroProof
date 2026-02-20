/**
 * VerifierManagement Component Tests
 * 
 * Basic tests to verify the component renders correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifierManagement } from '../../../src/components/VerifierManagement';
import { WalletProvider } from '../../../src/contexts/WalletContext';

// Mock the wallet service
vi.mock('../../../src/services/walletService', () => ({
  walletService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    getAddress: vi.fn(() => null),
    signTransaction: vi.fn(),
    isConnected: vi.fn(() => false),
  },
}));

// Mock the contract service
vi.mock('../../../src/services/contractService', () => ({
  contractService: {
    getAdmin: vi.fn(),
    addVerifier: vi.fn(),
    removeVerifier: vi.fn(),
    isVerifier: vi.fn(),
  },
}));

describe('VerifierManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    render(
      <WalletProvider>
        <VerifierManagement />
      </WalletProvider>
    );
    
    expect(screen.getByText('Verifier Management')).toBeInTheDocument();
  });

  it('should show wallet connection message when not connected', () => {
    render(
      <WalletProvider>
        <VerifierManagement />
      </WalletProvider>
    );
    
    expect(screen.getByText(/Please connect your wallet to manage verifiers/i)).toBeInTheDocument();
  });
});
