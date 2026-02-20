#!/usr/bin/env python3
"""
AgriProof Smart Contract Deployment Script

This script deploys the AgriProof smart contract to either:
- AlgoKit LocalNet (for local testing)
- Algorand TestNet (for testing on public network)

Usage:
    python smart_contracts/deploy.py --network localnet
    python smart_contracts/deploy.py --network testnet
"""

import argparse
import json
import os
from pathlib import Path
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algokit_utils import (
    ApplicationClient,
    get_localnet_default_account,
)
from agriproof.contract import AgriProofContract


# Configuration file path
CONFIG_FILE = Path(__file__).parent / "deployed_contract.json"


def get_algod_client(network: str) -> algod.AlgodClient:
    """
    Get Algorand client for the specified network.
    
    Args:
        network: Either 'localnet' or 'testnet'
        
    Returns:
        AlgodClient instance configured for the network
    """
    if network == "localnet":
        # AlgoKit LocalNet default configuration
        algod_address = "http://localhost:4001"
        algod_token = "a" * 64
        return algod.AlgodClient(algod_token, algod_address)
    
    elif network == "testnet":
        # TestNet configuration - requires environment variables
        algod_address = os.getenv("ALGOD_TESTNET_ADDRESS", "https://testnet-api.algonode.cloud")
        algod_token = os.getenv("ALGOD_TESTNET_TOKEN", "")
        return algod.AlgodClient(algod_token, algod_address)
    
    else:
        raise ValueError(f"Unknown network: {network}. Use 'localnet' or 'testnet'")


def get_deployer_account(network: str) -> tuple[str, str]:
    """
    Get deployer account credentials for the specified network.
    
    Args:
        network: Either 'localnet' or 'testnet'
        
    Returns:
        Tuple of (address, private_key)
    """
    if network == "localnet":
        # Use AlgoKit LocalNet default account
        account_info = get_localnet_default_account(algod.AlgodClient("a" * 64, "http://localhost:4001"))
        return account_info.address, account_info.private_key
    
    elif network == "testnet":
        # TestNet requires mnemonic from environment variable
        deployer_mnemonic = os.getenv("DEPLOYER_MNEMONIC")
        if not deployer_mnemonic:
            raise ValueError(
                "DEPLOYER_MNEMONIC environment variable is required for TestNet deployment.\n"
                "Set it to your 25-word mnemonic phrase."
            )
        
        private_key = mnemonic.to_private_key(deployer_mnemonic)
        address = account.address_from_private_key(private_key)
        return address, private_key
    
    else:
        raise ValueError(f"Unknown network: {network}")


def deploy_contract(network: str) -> dict:
    """
    Deploy the AgriProof smart contract to the specified network.
    
    Args:
        network: Either 'localnet' or 'testnet'
        
    Returns:
        Dictionary with deployment information
    """
    print(f"🚀 Deploying AgriProof contract to {network}...")
    
    # Get Algorand client
    algod_client = get_algod_client(network)
    
    # Get deployer account
    deployer_address, deployer_private_key = get_deployer_account(network)
    print(f"📝 Deployer address: {deployer_address}")
    
    # Check deployer balance
    account_info = algod_client.account_info(deployer_address)
    balance = account_info.get("amount", 0) / 1_000_000  # Convert microAlgos to Algos
    print(f"💰 Deployer balance: {balance:.6f} ALGO")
    
    if balance < 0.1:
        print("⚠️  Warning: Low balance. You may need more ALGO for deployment.")
    
    # Create application client
    app_client = ApplicationClient(
        algod_client=algod_client,
        app_spec=AgriProofContract.app_spec(),
        signer=deployer_private_key,
    )
    
    # Deploy the contract
    print("📦 Creating application...")
    app_id, app_address, txn_id = app_client.create()
    
    print(f"✅ Contract deployed successfully!")
    print(f"   App ID: {app_id}")
    print(f"   App Address: {app_address}")
    print(f"   Transaction ID: {txn_id}")
    
    # Save deployment information
    deployment_info = {
        "network": network,
        "app_id": app_id,
        "app_address": app_address,
        "deployer_address": deployer_address,
        "transaction_id": txn_id,
    }
    
    save_deployment_info(deployment_info)
    
    return deployment_info


def save_deployment_info(info: dict) -> None:
    """
    Save deployment information to configuration file.
    
    Args:
        info: Deployment information dictionary
    """
    # Load existing config if it exists
    config = {}
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, "r") as f:
            config = json.load(f)
    
    # Update with new deployment info
    network = info["network"]
    config[network] = info
    
    # Save to file
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)
    
    print(f"💾 Deployment info saved to {CONFIG_FILE}")


def main():
    """Main deployment function."""
    parser = argparse.ArgumentParser(
        description="Deploy AgriProof smart contract to Algorand"
    )
    parser.add_argument(
        "--network",
        choices=["localnet", "testnet"],
        required=True,
        help="Network to deploy to (localnet or testnet)",
    )
    
    args = parser.parse_args()
    
    try:
        deploy_contract(args.network)
        print("\n🎉 Deployment complete!")
        
    except Exception as e:
        print(f"\n❌ Deployment failed: {e}")
        raise


if __name__ == "__main__":
    main()
