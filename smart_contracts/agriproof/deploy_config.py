"""
Deployment configuration for AgriProof smart contract
"""

from algopy import Account


class DeployConfig:
    """Configuration for contract deployment"""
    
    # Network configurations
    LOCALNET_ALGOD_URL = "http://localhost:4001"
    LOCALNET_ALGOD_TOKEN = "a" * 64
    
    TESTNET_ALGOD_URL = "https://testnet-api.algonode.cloud"
    TESTNET_ALGOD_TOKEN = ""
    
    # Contract parameters
    CONTRACT_NAME = "AgriProofContract"
    
    @staticmethod
    def get_network_config(network: str) -> dict:
        """
        Get configuration for specified network
        
        Args:
            network: "localnet" or "testnet"
            
        Returns:
            Dictionary with algod_url and algod_token
        """
        if network == "localnet":
            return {
                "algod_url": DeployConfig.LOCALNET_ALGOD_URL,
                "algod_token": DeployConfig.LOCALNET_ALGOD_TOKEN
            }
        elif network == "testnet":
            return {
                "algod_url": DeployConfig.TESTNET_ALGOD_URL,
                "algod_token": DeployConfig.TESTNET_ALGOD_TOKEN
            }
        else:
            raise ValueError(f"Unknown network: {network}")
