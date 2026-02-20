/**
 * Contract Service
 * 
 * Service for interacting with AgriProof smart contract
 */

import algosdk from 'algosdk';
import { algodClient, getSuggestedParams, waitForConfirmation } from './algoClient';
import { walletService } from './walletService';
import { contractConfig } from '../config/contract';
import type { Claim, Enrollment } from '../types/claim';
import type { TransactionResult } from '../types/contract';

// Helper to convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export interface ContractService {
  enrollFarmer(deadlineDays: number): Promise<TransactionResult>;
  submitClaim(proofHash: string): Promise<TransactionResult>;
  verifyClaim(farmerAddress: string, approved: boolean): Promise<TransactionResult>;
  addVerifier(verifierAddress: string): Promise<TransactionResult>;
  removeVerifier(verifierAddress: string): Promise<TransactionResult>;
  getClaim(farmerAddress: string): Promise<Claim | null>;
  getEnrollment(farmerAddress: string): Promise<Enrollment | null>;
  isVerifier(address: string): Promise<boolean>;
  getAdmin(): Promise<string>;
  getAllClaims(): Promise<Claim[]>;
}

class AgriProofContractService implements ContractService {
  private appId: number;

  constructor() {
    this.appId = contractConfig.appId;
  }

  async enrollFarmer(deadlineDays: number): Promise<TransactionResult> {
    try {
      const address = walletService.getAddress();
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const suggestedParams = await getSuggestedParams();
      
      // Create application call transaction
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        suggestedParams,
        appIndex: this.appId,
        sender: address,
        appArgs: [
          stringToUint8Array('enroll_farmer'),
          algosdk.encodeUint64(deadlineDays)
        ]
      });

      // Sign and send transaction
      const signedTxn = await walletService.signTransaction(txn);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      // Wait for confirmation
      await waitForConfirmation(txId);

      return {
        success: true,
        transactionId: txId
      };
    } catch (error) {
      console.error('Enrollment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Enrollment failed'
      };
    }
  }

  async submitClaim(proofHash: string): Promise<TransactionResult> {
    try {
      const address = walletService.getAddress();
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const suggestedParams = await getSuggestedParams();
      
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        suggestedParams,
        sender: address,
        appIndex: this.appId,
        appArgs: [
          stringToUint8Array('submit_claim'),
          stringToUint8Array(proofHash)
        ]
      });

      const signedTxn = await walletService.signTransaction(txn);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      await waitForConfirmation(txId);

      return {
        success: true,
        transactionId: txId
      };
    } catch (error) {
      console.error('Claim submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Claim submission failed'
      };
    }
  }

  async verifyClaim(farmerAddress: string, approved: boolean): Promise<TransactionResult> {
    try {
      const address = walletService.getAddress();
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const suggestedParams = await getSuggestedParams();
      
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        suggestedParams,
        sender: address,
        appIndex: this.appId,
        appArgs: [
          stringToUint8Array('verify_claim'),
          algosdk.decodeAddress(farmerAddress).publicKey,
          new Uint8Array([approved ? 1 : 0])
        ]
      });

      const signedTxn = await walletService.signTransaction(txn);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      await waitForConfirmation(txId);

      return {
        success: true,
        transactionId: txId
      };
    } catch (error) {
      console.error('Claim verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Claim verification failed'
      };
    }
  }

  async addVerifier(verifierAddress: string): Promise<TransactionResult> {
    try {
      const address = walletService.getAddress();
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const suggestedParams = await getSuggestedParams();
      
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        suggestedParams,
        sender: address,
        appIndex: this.appId,
        appArgs: [
          stringToUint8Array('add_verifier'),
          algosdk.decodeAddress(verifierAddress).publicKey
        ]
      });

      const signedTxn = await walletService.signTransaction(txn);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      await waitForConfirmation(txId);

      return {
        success: true,
        transactionId: txId
      };
    } catch (error) {
      console.error('Add verifier failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Add verifier failed'
      };
    }
  }

  async removeVerifier(verifierAddress: string): Promise<TransactionResult> {
    try {
      const address = walletService.getAddress();
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const suggestedParams = await getSuggestedParams();
      
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        suggestedParams,
        sender: address,
        appIndex: this.appId,
        appArgs: [
          stringToUint8Array('remove_verifier'),
          algosdk.decodeAddress(verifierAddress).publicKey
        ]
      });

      const signedTxn = await walletService.signTransaction(txn);
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;
      
      await waitForConfirmation(txId);

      return {
        success: true,
        transactionId: txId
      };
    } catch (error) {
      console.error('Remove verifier failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Remove verifier failed'
      };
    }
  }

  async getClaim(farmerAddress: string): Promise<Claim | null> {
    try {
      // TODO: Implement proper box storage reading
      // For now, return null as this requires proper ABI decoding
      console.log('getClaim not yet implemented for', farmerAddress);
      return null;
    } catch (error) {
      console.error('Get claim failed:', error);
      return null;
    }
  }

  async getEnrollment(farmerAddress: string): Promise<Enrollment | null> {
    try {
      // TODO: Implement proper box storage reading
      // For now, return null as this requires proper ABI decoding
      console.log('getEnrollment not yet implemented for', farmerAddress);
      return null;
    } catch (error) {
      console.error('Get enrollment failed:', error);
      return null;
    }
  }

  async isVerifier(address: string): Promise<boolean> {
    try {
      // TODO: Implement proper global state reading
      // For now, return false as this requires proper ABI decoding
      console.log('isVerifier not yet implemented for', address);
      return false;
    } catch (error) {
      console.error('Is verifier check failed:', error);
      return false;
    }
  }

  async getAdmin(): Promise<string> {
    try {
      const appInfo = await algodClient.getApplicationByID(this.appId).do();
      
      // Parse global state to get admin address
      const globalState = appInfo.params.globalState;
      if (!globalState) {
        throw new Error('Global state not found');
      }
      
      const adminKey = new TextEncoder().encode('admin');
      const adminKeyBase64 = btoa(String.fromCharCode(...adminKey));
      
      const adminEntry = globalState.find((entry: any) => entry.key === adminKeyBase64);
      if (adminEntry && adminEntry.value.bytes) {
        const bytesStr = typeof adminEntry.value.bytes === 'string' 
          ? adminEntry.value.bytes 
          : String.fromCharCode(...new Uint8Array(adminEntry.value.bytes));
        const bytes = Uint8Array.from(atob(bytesStr), c => c.charCodeAt(0));
        return algosdk.encodeAddress(bytes);
      }
      
      throw new Error('Admin address not found');
    } catch (error) {
      console.error('Get admin failed:', error);
      throw error;
    }
  }

  async getAllClaims(): Promise<Claim[]> {
    try {
      // Get all boxes for this application
      const boxes = await algodClient.getApplicationBoxes(this.appId).do();
      
      const claims: Claim[] = [];
      
      // Filter for claim boxes (those starting with "claim_")
      for (const box of boxes.boxes) {
        const boxName = new TextDecoder().decode(box.name);
        
        if (boxName.startsWith('claim_')) {
          // Extract farmer address from box name
          const farmerAddress = boxName.substring(6); // Remove "claim_" prefix
          
          // Get the claim data
          const claim = await this.getClaim(farmerAddress);
          if (claim) {
            claims.push(claim);
          }
        }
      }
      
      return claims;
    } catch (error) {
      console.error('Get all claims failed:', error);
      return [];
    }
  }
}

// Export singleton instance
export const contractService = new AgriProofContractService();
