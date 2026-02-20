"""
Pytest configuration and fixtures for smart contract testing
"""

import pytest
from algosdk.v2client.algod import AlgodClient
from algosdk.account import generate_account
from algosdk.transaction import PaymentTxn, wait_for_confirmation
from algosdk import mnemonic


@pytest.fixture(scope="session")
def algod_client():
    """
    Create AlgodClient for AlgoKit LocalNet
    """
    algod_url = "http://localhost:4001"
    algod_token = "a" * 64
    return AlgodClient(algod_token, algod_url)


@pytest.fixture(scope="session")
def funded_account(algod_client):
    """
    Create and fund a test account from LocalNet dispenser
    """
    # Generate new account
    private_key, address = generate_account()
    
    # In LocalNet, we can use a pre-funded account to fund our test account
    # This is the default LocalNet dispenser account
    dispenser_mnemonic = "auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch"
    dispenser_private_key = mnemonic.to_private_key(dispenser_mnemonic)
    dispenser_address = mnemonic.to_public_key(dispenser_mnemonic)
    
    # Fund the test account
    params = algod_client.suggested_params()
    txn = PaymentTxn(
        sender=dispenser_address,
        sp=params,
        receiver=address,
        amt=10_000_000  # 10 ALGO
    )
    signed_txn = txn.sign(dispenser_private_key)
    txid = algod_client.send_transaction(signed_txn)
    wait_for_confirmation(algod_client, txid)
    
    return {
        "address": address,
        "private_key": private_key
    }


@pytest.fixture
def admin_account(funded_account):
    """Admin account fixture"""
    return funded_account


@pytest.fixture
def farmer_account(algod_client, funded_account):
    """Create a funded farmer account"""
    private_key, address = generate_account()
    
    # Fund from the funded_account
    params = algod_client.suggested_params()
    txn = PaymentTxn(
        sender=funded_account["address"],
        sp=params,
        receiver=address,
        amt=5_000_000  # 5 ALGO
    )
    signed_txn = txn.sign(funded_account["private_key"])
    txid = algod_client.send_transaction(signed_txn)
    wait_for_confirmation(algod_client, txid)
    
    return {
        "address": address,
        "private_key": private_key
    }


@pytest.fixture
def verifier_account(algod_client, funded_account):
    """Create a funded verifier account"""
    private_key, address = generate_account()
    
    # Fund from the funded_account
    params = algod_client.suggested_params()
    txn = PaymentTxn(
        sender=funded_account["address"],
        sp=params,
        receiver=address,
        amt=5_000_000  # 5 ALGO
    )
    signed_txn = txn.sign(funded_account["private_key"])
    txid = algod_client.send_transaction(signed_txn)
    wait_for_confirmation(algod_client, txid)
    
    return {
        "address": address,
        "private_key": private_key
    }


@pytest.fixture
def deployed_contract(algod_client, admin_account):
    """
    Deploy AgriProof contract and return app ID and admin account
    
    Note: This is a placeholder. Actual deployment will be implemented
    when we have the compiled contract.
    """
    # TODO: Implement actual contract deployment
    # For now, return a mock structure
    return {
        "app_id": 0,  # Will be set after deployment
        "admin": admin_account
    }
