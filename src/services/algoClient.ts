/**
 * Algorand Client Service
 * 
 * Provides configured AlgodClient for interacting with Algorand TestNet
 */

import algosdk from 'algosdk';

// TestNet configuration
const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;

// Create and export AlgodClient instance
export const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

/**
 * Get suggested transaction parameters
 */
export async function getSuggestedParams() {
  return await algodClient.getTransactionParams().do();
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(txId: string) {
  const response = await algosdk.waitForConfirmation(algodClient, txId, 4);
  return response;
}

/**
 * Get account information
 */
export async function getAccountInfo(address: string) {
  return await algodClient.accountInformation(address).do();
}
