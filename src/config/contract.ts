/**
 * AgriProof Smart Contract Configuration
 * 
 * This file contains the deployed contract configuration for different networks.
 * Update the APP_ID values after deploying the contract to each network.
 */

/**
 * Network type for Algorand
 */
export type Network = 'localnet' | 'testnet' | 'mainnet';

/**
 * Contract configuration for a specific network
 */
export interface ContractConfig {
  appId: number;
  network: Network;
  algodUrl: string;
  algodToken: string;
}

/**
 * Contract configurations for different networks
 */
const CONTRACT_CONFIGS: Record<Network, ContractConfig> = {
  localnet: {
    appId: 0, // Update after deploying to LocalNet
    network: 'localnet',
    algodUrl: 'http://localhost:4001',
    algodToken: 'a'.repeat(64),
  },
  testnet: {
    appId: 0, // Update after deploying to TestNet
    network: 'testnet',
    algodUrl: 'https://testnet-api.algonode.cloud',
    algodToken: '',
  },
  mainnet: {
    appId: 0, // Update after deploying to MainNet
    network: 'mainnet',
    algodUrl: 'https://mainnet-api.algonode.cloud',
    algodToken: '',
  },
};

/**
 * Get the current network from environment variable
 * Defaults to 'testnet' if not specified
 */
export function getCurrentNetwork(): Network {
  const network = import.meta.env.VITE_ALGORAND_NETWORK as Network;
  return network || 'testnet';
}

/**
 * Get the contract configuration for the current network
 */
export function getContractConfig(): ContractConfig {
  const network = getCurrentNetwork();
  const config = CONTRACT_CONFIGS[network];
  
  if (config.appId === 0) {
    console.warn(
      `⚠️  Contract not deployed to ${network}. ` +
      `Please deploy the contract and update src/config/contract.ts`
    );
  }
  
  return config;
}

/**
 * Get the contract configuration for a specific network
 */
export function getContractConfigForNetwork(network: Network): ContractConfig {
  return CONTRACT_CONFIGS[network];
}

/**
 * Update contract app ID for a specific network
 * This is a helper function for development/testing
 */
export function setContractAppId(network: Network, appId: number): void {
  CONTRACT_CONFIGS[network].appId = appId;
  console.log(`✅ Contract app ID for ${network} set to ${appId}`);
}

// Export the current contract configuration
export const contractConfig = getContractConfig();

// Export app ID for convenience
export const APP_ID = contractConfig.appId;
