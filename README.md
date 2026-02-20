# AgriProof - Agricultural Claim Registry

AgriProof is a decentralized agricultural claim registry system built on the Algorand blockchain. The system provides a transparent, tamper-proof platform for managing crop damage claims through smart contracts, enabling farmers to submit claims, verifiers to approve them, and administrators to manage the system.

## Features

- **Farmer Enrollment**: Farmers can enroll in the system with configurable claim deadlines
- **Claim Submission**: Enrolled farmers can submit crop damage claims with cryptographic proof hashes
- **Claim Verification**: Authorized verifiers can approve or reject pending claims
- **Verifier Management**: System administrators can add and remove authorized verifiers
- **Claim History**: View complete claim history with filtering and status tracking
- **Wallet Integration**: Seamless integration with Pera Wallet for transaction signing
- **Role-Based Access Control**: Secure access control for admin, verifier, and farmer roles

## Architecture

The system consists of two main components:

1. **Smart Contract** (Python/Beaker): Algorand smart contract managing all on-chain state and business logic
2. **Frontend** (React/TypeScript/Vite): Web application providing the user interface

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://www.python.org/)
- **AlgoKit** - Algorand development toolkit
  ```bash
  pipx install algokit
  ```
- **Pera Wallet** - Mobile or browser extension for Algorand
  - [iOS](https://apps.apple.com/app/pera-algo-wallet/id1459898525)
  - [Android](https://play.google.com/store/apps/details?id=com.algorand.android)
  - [Chrome Extension](https://chrome.google.com/webstore/detail/pera-wallet/mlapfmicmhbfgdcnbkjjcjgfmjkdpnkn)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agriproof-claim-registry
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies

```bash
npm install
```

## Smart Contract Deployment

### Deploy to LocalNet (Local Testing)

1. Start AlgoKit LocalNet:
   ```bash
   algokit localnet start
   ```

2. Deploy the contract:
   ```bash
   python smart_contracts/deploy.py --network localnet
   ```

3. The deployment script will output the App ID. Update `src/config/contract.ts`:
   ```typescript
   localnet: {
     appId: YOUR_APP_ID, // Replace with actual App ID
     // ...
   }
   ```

### Deploy to TestNet

1. Create an Algorand account on TestNet and fund it:
   - Use the [TestNet Dispenser](https://bank.testnet.algorand.network/) to get test ALGO

2. Set your deployer mnemonic as an environment variable:
   ```bash
   export DEPLOYER_MNEMONIC="your 25-word mnemonic phrase here"
   ```

3. Deploy the contract:
   ```bash
   python smart_contracts/deploy.py --network testnet
   ```

4. Update `src/config/contract.ts` with the TestNet App ID:
   ```typescript
   testnet: {
     appId: YOUR_APP_ID, // Replace with actual App ID
     // ...
   }
   ```

### Deployment Configuration

The deployment script saves deployment information to `smart_contracts/deployed_contract.json`. This file contains:
- App ID
- App Address
- Deployer Address
- Transaction ID

## Frontend Setup and Run

### Development Mode

1. Set the network environment variable (optional, defaults to testnet):
   ```bash
   export VITE_ALGORAND_NETWORK=testnet  # or localnet
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

### Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

3. Deploy the `dist/` directory to your hosting service

## Testing

### Smart Contract Tests

Run all smart contract tests:
```bash
pytest tests/smart_contract/ -v
```

Run only unit tests:
```bash
pytest tests/smart_contract/unit/ -v
```

Run only property-based tests:
```bash
pytest tests/smart_contract/properties/ -v --hypothesis-show-statistics
```

### Frontend Tests

Run all frontend tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Environment Variables

### Frontend Environment Variables

Create a `.env` file in the project root:

```env
# Network configuration (localnet, testnet, or mainnet)
VITE_ALGORAND_NETWORK=testnet
```

### Deployment Environment Variables

For TestNet deployment:

```bash
# Required for TestNet deployment
export DEPLOYER_MNEMONIC="your 25-word mnemonic phrase"

# Optional: Custom TestNet node (defaults to algonode.cloud)
export ALGOD_TESTNET_ADDRESS="https://testnet-api.algonode.cloud"
export ALGOD_TESTNET_TOKEN=""
```

## Usage Guide

### For Farmers

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection in Pera Wallet
2. **Enroll**: Enter the number of days until your claim deadline and click "Enroll"
3. **Submit Claim**: After enrollment, enter your proof hash (cryptographic hash of damage evidence) and submit
4. **Track Status**: View your claim status in the Claim History section

### For Verifiers

1. **Connect Wallet**: Connect your authorized verifier wallet
2. **View Pending Claims**: See all pending claims in the Claim Verification section
3. **Verify Claims**: Review each claim and click "Approve" or "Reject"

### For Administrators

1. **Connect Wallet**: Connect the admin wallet (the deployer address)
2. **Manage Verifiers**: Add or remove verifier addresses in the Verifier Management section
3. **Monitor System**: View all claims and system activity in the Claim History

## Project Structure

```
agriproof-claim-registry/
├── smart_contracts/          # Smart contract code
│   ├── agriproof/
│   │   ├── contract.py       # Main contract logic
│   │   └── __init__.py
│   ├── deploy.py             # Deployment script
│   └── deployed_contract.json # Deployment info (generated)
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── WalletConnect.tsx
│   │   ├── EnrollmentForm.tsx
│   │   ├── ClaimSubmission.tsx
│   │   ├── ClaimVerification.tsx
│   │   ├── VerifierManagement.tsx
│   │   ├── ClaimHistory.tsx
│   │   └── ClaimStatus.tsx
│   ├── services/             # Service layer
│   │   ├── algoClient.ts     # Algorand client setup
│   │   ├── walletService.ts  # Wallet integration
│   │   └── contractService.ts # Contract interaction
│   ├── contexts/             # React contexts
│   │   └── WalletContext.tsx
│   ├── types/                # TypeScript types
│   │   ├── claim.ts
│   │   └── contract.ts
│   ├── utils/                # Utility functions
│   │   ├── errorHandler.ts
│   │   └── formatters.ts
│   ├── config/               # Configuration
│   │   └── contract.ts       # Contract configuration
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── tests/                    # Test files
│   ├── smart_contract/       # Smart contract tests
│   │   ├── unit/
│   │   └── properties/
│   └── frontend/             # Frontend tests
│       ├── unit/
│       └── properties/
├── package.json              # Node.js dependencies
├── requirements.txt          # Python dependencies
├── vite.config.ts            # Vite configuration
├── vitest.config.ts          # Vitest configuration
└── pytest.ini                # Pytest configuration
```

## Key Technologies

- **Blockchain**: Algorand
- **Smart Contract**: Python, Beaker, AlgoPy
- **Frontend**: React, TypeScript, Vite
- **Wallet**: Pera Wallet
- **Testing**: Pytest, Hypothesis, Vitest, fast-check
- **Development**: AlgoKit

## Security Considerations

- **Private Keys**: Never commit private keys or mnemonics to version control
- **Environment Variables**: Use environment variables for sensitive configuration
- **Proof Hashes**: Store only cryptographic hashes on-chain, not sensitive data
- **Access Control**: The system enforces role-based access control on-chain
- **Immutability**: Proof hashes and enrollment data are immutable after creation

## Troubleshooting

### Contract Deployment Issues

**Error: "Insufficient balance"**
- Ensure your deployer account has enough ALGO (at least 0.1 ALGO for deployment)
- For TestNet, use the [TestNet Dispenser](https://bank.testnet.algorand.network/)

**Error: "DEPLOYER_MNEMONIC environment variable is required"**
- Set the environment variable with your 25-word mnemonic phrase
- Make sure there are no extra spaces or quotes

### Frontend Issues

**Error: "Contract not deployed"**
- Deploy the smart contract first
- Update `src/config/contract.ts` with the correct App ID

**Error: "Wallet not connected"**
- Install Pera Wallet browser extension or mobile app
- Click "Connect Wallet" and approve the connection

**Transaction Failures**
- Ensure you have enough ALGO for transaction fees (minimum 0.001 ALGO per transaction)
- Check that you're connected to the correct network (LocalNet vs TestNet)
- Verify your account has the required role (admin, verifier, or enrolled farmer)

### LocalNet Issues

**Error: "Connection refused to localhost:4001"**
- Start AlgoKit LocalNet: `algokit localnet start`
- Check LocalNet status: `algokit localnet status`
- Reset LocalNet if needed: `algokit localnet reset`

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [Algorand Developer Portal](https://developer.algorand.org/)
- Join the [Algorand Discord](https://discord.gg/algorand)

## Acknowledgments

Built with:
- [Algorand](https://www.algorand.com/)
- [AlgoKit](https://github.com/algorandfoundation/algokit-cli)
- [Pera Wallet](https://perawallet.app/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
