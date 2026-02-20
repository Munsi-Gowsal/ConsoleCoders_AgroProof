# AgriProof Deployment Guide

This guide provides step-by-step instructions for deploying the AgriProof smart contract and frontend application.

## Quick Start

### LocalNet Deployment (Development)

```bash
# 1. Start AlgoKit LocalNet
algokit localnet start

# 2. Deploy contract
python smart_contracts/deploy.py --network localnet

# 3. Update contract configuration
# Edit src/config/contract.ts and set the localnet appId

# 4. Start frontend
npm run dev
```

### TestNet Deployment (Testing)

```bash
# 1. Set deployer mnemonic
export DEPLOYER_MNEMONIC="your 25-word mnemonic phrase"

# 2. Deploy contract
python smart_contracts/deploy.py --network testnet

# 3. Update contract configuration
# Edit src/config/contract.ts and set the testnet appId

# 4. Build and deploy frontend
npm run build
# Deploy dist/ folder to your hosting service
```

## Detailed Deployment Steps

### Step 1: Prepare Deployer Account

#### For LocalNet
No preparation needed - AlgoKit LocalNet provides pre-funded accounts.

#### For TestNet
1. Create a new Algorand account or use an existing one
2. Save your 25-word mnemonic phrase securely
3. Get your account address
4. Fund your account using the [TestNet Dispenser](https://bank.testnet.algorand.network/)
   - Minimum recommended: 1 ALGO
   - Deployment costs approximately 0.1 ALGO

### Step 2: Deploy Smart Contract

#### LocalNet Deployment

```bash
# Start LocalNet
algokit localnet start

# Verify LocalNet is running
algokit localnet status

# Deploy contract
python smart_contracts/deploy.py --network localnet

# Expected output:
# 🚀 Deploying AgriProof contract to localnet...
# 📝 Deployer address: [ADDRESS]
# 💰 Deployer balance: [BALANCE] ALGO
# 📦 Creating application...
# ✅ Contract deployed successfully!
#    App ID: [APP_ID]
#    App Address: [APP_ADDRESS]
#    Transaction ID: [TXN_ID]
# 💾 Deployment info saved to smart_contracts/deployed_contract.json
```

#### TestNet Deployment

```bash
# Set deployer mnemonic
export DEPLOYER_MNEMONIC="word1 word2 word3 ... word25"

# Deploy contract
python smart_contracts/deploy.py --network testnet

# Expected output:
# 🚀 Deploying AgriProof contract to testnet...
# 📝 Deployer address: [ADDRESS]
# 💰 Deployer balance: [BALANCE] ALGO
# 📦 Creating application...
# ✅ Contract deployed successfully!
#    App ID: [APP_ID]
#    App Address: [APP_ADDRESS]
#    Transaction ID: [TXN_ID]
# 💾 Deployment info saved to smart_contracts/deployed_contract.json
```

### Step 3: Update Frontend Configuration

1. Open `src/config/contract.ts`

2. Update the `appId` for your deployed network:

```typescript
const CONTRACT_CONFIGS: Record<Network, ContractConfig> = {
  localnet: {
    appId: 1234, // Replace with your LocalNet App ID
    // ...
  },
  testnet: {
    appId: 5678, // Replace with your TestNet App ID
    // ...
  },
  // ...
};
```

3. The App ID can be found in:
   - Terminal output from deployment script
   - `smart_contracts/deployed_contract.json` file

### Step 4: Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and set the network:
```env
VITE_ALGORAND_NETWORK=testnet  # or localnet
```

### Step 5: Run Frontend

#### Development Mode

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

#### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist/ folder to hosting service
```

## Deployment Verification

### Verify Smart Contract Deployment

1. Check the deployment info file:
```bash
cat smart_contracts/deployed_contract.json
```

2. Query the contract on-chain:
```bash
# For LocalNet
algokit goal app info --app-id [APP_ID] --algod-address http://localhost:4001 --algod-token aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# For TestNet
algokit goal app info --app-id [APP_ID] --algod-address https://testnet-api.algonode.cloud
```

3. Verify the admin address matches your deployer address

### Verify Frontend Configuration

1. Start the frontend in development mode
2. Open browser console
3. Check for configuration warnings:
   - ⚠️ "Contract not deployed" means appId is still 0
   - ✅ No warnings means configuration is correct

4. Try connecting your wallet:
   - Click "Connect Wallet"
   - Approve connection in Pera Wallet
   - Verify your address is displayed

## Post-Deployment Setup

### Add Verifiers (Admin Only)

1. Connect the admin wallet (deployer address)
2. Navigate to "Verifier Management" section
3. Enter verifier address and click "Add Verifier"
4. Approve transaction in wallet

### Test Enrollment (Any User)

1. Connect a farmer wallet
2. Navigate to "Enrollment" section
3. Enter deadline days (e.g., 30)
4. Click "Enroll" and approve transaction
5. Verify enrollment success message

### Test Claim Submission (Enrolled Farmer)

1. After enrollment, navigate to "Submit Claim"
2. Enter a proof hash (any string, e.g., "test_proof_hash_123")
3. Click "Submit Claim" and approve transaction
4. Verify claim appears in "Claim History"

### Test Claim Verification (Verifier Only)

1. Connect a verifier wallet
2. Navigate to "Claim Verification"
3. View pending claims
4. Click "Approve" or "Reject" for a claim
5. Approve transaction in wallet
6. Verify claim status updates in "Claim History"

## Hosting Options

### Frontend Hosting

Popular options for hosting the React frontend:

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **GitHub Pages**
   ```bash
   npm run build
   # Push dist/ folder to gh-pages branch
   ```

4. **AWS S3 + CloudFront**
   - Upload dist/ folder to S3 bucket
   - Configure CloudFront distribution
   - Set up custom domain

### Environment Variables for Hosting

Set these environment variables in your hosting platform:

- `VITE_ALGORAND_NETWORK`: `testnet` or `mainnet`

## Troubleshooting

### Deployment Script Errors

**Error: "ModuleNotFoundError: No module named 'algopy'"**
```bash
pip install -r requirements.txt
```

**Error: "DEPLOYER_MNEMONIC environment variable is required"**
```bash
export DEPLOYER_MNEMONIC="your 25-word mnemonic phrase"
```

**Error: "Insufficient balance"**
- Fund your account with more ALGO
- For TestNet: https://bank.testnet.algorand.network/

### Frontend Build Errors

**Error: "Cannot find module '@/config/contract'"**
```bash
# Ensure contract.ts exists
ls src/config/contract.ts

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error: "Contract not deployed" warning**
- Deploy the smart contract first
- Update `src/config/contract.ts` with correct App ID

### Runtime Errors

**Error: "Transaction failed: invalid application id"**
- Verify App ID in `src/config/contract.ts` matches deployed contract
- Check you're connected to the correct network

**Error: "Transaction failed: unauthorized"**
- Verify you have the required role (admin, verifier, or enrolled farmer)
- Check you're using the correct wallet address

## Maintenance

### Updating the Smart Contract

⚠️ **Warning**: Smart contracts on Algorand are immutable. To update:

1. Deploy a new version of the contract
2. Update frontend configuration with new App ID
3. Migrate data if necessary (requires custom migration script)
4. Update documentation with new App ID

### Monitoring

Monitor your deployed contract:

1. **Transaction Volume**: Track number of enrollments, claims, and verifications
2. **Error Rates**: Monitor failed transactions
3. **User Activity**: Track active farmers, verifiers, and claims
4. **Contract Balance**: Ensure contract has sufficient ALGO for operations

### Backup

Important data to backup:

1. **Deployer Mnemonic**: Store securely offline
2. **App ID**: Document in multiple locations
3. **Deployment Info**: Keep `deployed_contract.json` in version control
4. **Verifier List**: Maintain off-chain backup of authorized verifiers

## Security Checklist

Before deploying to production:

- [ ] Deployer mnemonic is stored securely (not in code or version control)
- [ ] Environment variables are configured correctly
- [ ] Contract App ID is correct in frontend configuration
- [ ] All tests pass (smart contract and frontend)
- [ ] Security audit completed (for production)
- [ ] Access control tested (admin, verifier, farmer roles)
- [ ] Error handling tested
- [ ] Wallet integration tested with real wallets
- [ ] Transaction fees documented for users
- [ ] Backup procedures documented
- [ ] Monitoring and alerting configured

## Next Steps

After successful deployment:

1. **Documentation**: Update user documentation with deployed App ID
2. **Testing**: Perform end-to-end testing on deployed contract
3. **Monitoring**: Set up monitoring and alerting
4. **User Onboarding**: Create guides for farmers and verifiers
5. **Support**: Set up support channels for users
6. **Maintenance**: Plan for ongoing maintenance and updates

## Resources

- [Algorand Developer Portal](https://developer.algorand.org/)
- [AlgoKit Documentation](https://github.com/algorandfoundation/algokit-cli)
- [Pera Wallet Documentation](https://docs.perawallet.app/)
- [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/)
- [Algorand Explorer (TestNet)](https://testnet.algoexplorer.io/)
- [Algorand Explorer (MainNet)](https://algoexplorer.io/)
