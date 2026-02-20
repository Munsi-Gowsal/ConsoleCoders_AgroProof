/**
 * Wallet Service
 * 
 * Provides Pera Wallet integration for transaction signing and account management
 */

import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

export interface WalletService {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  getAddress(): string | null;
  signTransaction(txn: algosdk.Transaction): Promise<Uint8Array>;
  isConnected(): boolean;
}

class PeraWalletService implements WalletService {
  private peraWallet: PeraWalletConnect;
  private accountAddress: string | null = null;

  constructor() {
    this.peraWallet = new PeraWalletConnect();
    
    // Reconnect to session if exists
    this.peraWallet.reconnectSession().then((accounts) => {
      if (accounts.length > 0) {
        this.accountAddress = accounts[0];
      }
    }).catch((error) => {
      console.error('Failed to reconnect session:', error);
    });

    // Handle disconnect event
    this.peraWallet.connector?.on('disconnect', () => {
      this.accountAddress = null;
    });
  }

  async connect(): Promise<string> {
    try {
      const accounts = await this.peraWallet.connect();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.accountAddress = accounts[0];
      return this.accountAddress;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw new Error('Failed to connect wallet. Please try again.');
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.peraWallet.disconnect();
      this.accountAddress = null;
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      throw new Error('Failed to disconnect wallet.');
    }
  }

  getAddress(): string | null {
    return this.accountAddress;
  }

  async signTransaction(txn: algosdk.Transaction): Promise<Uint8Array> {
    if (!this.accountAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const txnGroup = [{ txn, signers: [this.accountAddress] }];
      const signedTxns = await this.peraWallet.signTransaction([txnGroup]);
      return signedTxns[0];
    } catch (error) {
      console.error('Transaction signing failed:', error);
      
      // Check if user rejected
      if (error instanceof Error && error.message.includes('rejected')) {
        throw new Error('Transaction was cancelled by user.');
      }
      
      throw new Error('Failed to sign transaction. Please try again.');
    }
  }

  isConnected(): boolean {
    return this.accountAddress !== null;
  }
}

// Export singleton instance
export const walletService = new PeraWalletService();
