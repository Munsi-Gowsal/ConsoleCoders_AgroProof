# Implementation Plan: AgriProof Claim Registry

## Overview

This implementation plan breaks down the AgriProof agricultural claim registry system into discrete coding tasks. The system consists of an Algorand smart contract (Python/Beaker) and a React frontend (TypeScript/Vite) with Pera Wallet integration. Tasks are organized to build incrementally, validating core functionality early through code.

## Tasks

- [x] 1. Clean up default Vite template files
  - Remove src/App.css (will be replaced with AgriProof-specific styles)
  - Remove src/assets/react.svg (not needed)
  - Remove public/vite.svg (not needed)
  - Clear boilerplate content from src/App.tsx, src/index.css
  - _Requirements: 11.6_

- [x] 2. Set up smart contract project structure
  - [x] 2.1 Create smart contract directory structure and core files
    - Create `smart_contracts/` directory with `agriproof/` subdirectory
    - Create `smart_contracts/agriproof/contract.py` for main contract logic
    - Create `smart_contracts/agriproof/__init__.py`
    - Create `smart_contracts/agriproof/deploy_config.py` for deployment configuration
    - _Requirements: 1.1, 12.1_
  
  - [x] 2.2 Set up Python testing infrastructure
    - Create `tests/smart_contract/` directory structure
    - Create `tests/smart_contract/conftest.py` with pytest fixtures for AlgoKit LocalNet
    - Install pytest, hypothesis, and algorand-python-testing dependencies
    - Create `tests/smart_contract/unit/` and `tests/smart_contract/properties/` directories
    - _Requirements: 12.2, 12.3_

- [x] 3. Implement smart contract data models and storage
  - [x] 3.1 Define data structures and enums
    - Implement ClaimStatus enum (PENDING, APPROVED, REJECTED)
    - Implement Claim NamedTuple with all fields (proof_hash, status, submission_timestamp, verifier_address, verification_timestamp)
    - Implement Enrollment NamedTuple (enrollment_timestamp, claim_deadline)
    - Define box storage key patterns (claim_{address}, enrollment_{address}, verifiers)
    - _Requirements: 2.1, 2.5, 3.4, 3.5, 5.5_
  
  - [ ]* 3.2 Write property test for data serialization round-trip
    - **Property 17: Data serialization round-trip**
    - **Validates: Requirements 12.5**
    - Generate random Claim and Enrollment structures
    - Verify serialization to box storage and deserialization preserves all fields
    - _Requirements: 12.4, 12.5_

- [x] 4. Implement smart contract initialization and admin management
  - [x] 4.1 Implement contract creation method
    - Write @app.create method that sets deployer as admin in global state
    - Initialize contract with zero enrollments and claims
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 4.2 Write property test for admin immutability
    - **Property 1: Admin immutability**
    - **Validates: Requirements 1.4**
    - Generate random sequences of operations
    - Verify admin address never changes after deployment
    - _Requirements: 1.4, 12.4_
  
  - [ ]* 4.3 Write unit tests for initialization
    - Test admin is set correctly on deployment
    - Test initial state is empty
    - _Requirements: 1.2, 1.3_

- [x] 5. Implement farmer enrollment functionality
  - [x] 5.1 Implement enroll_farmer method
    - Write @app.external method accepting deadline_days parameter
    - Calculate claim_deadline from current timestamp + deadline_days
    - Store Enrollment in box storage with key enrollment_{farmer_address}
    - Implement duplicate enrollment check
    - Emit enrollment event
    - Add error handling (ERR_ALREADY_ENROLLED, ERR_INVALID_DEADLINE)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 15.1_
  
  - [x] 5.2 Implement get_enrollment query method
    - Write @app.external(read_only=True) method to retrieve enrollment details
    - Return EnrollmentDetails or error if not found
    - _Requirements: 2.1, 2.5_
  
  - [ ]* 5.3 Write property tests for enrollment
    - **Property 2: Enrollment records farmer with deadline**
    - **Validates: Requirements 2.1, 2.2**
    - **Property 3: Duplicate enrollment prevention**
    - **Validates: Requirements 2.3**
    - **Property 4: Enrollment timestamp storage**
    - **Validates: Requirements 2.5**
    - Generate random farmer addresses and deadline values
    - Verify enrollment records match expected values
    - Verify duplicate enrollments are rejected
    - Verify timestamps are stored correctly
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 12.4_
  
  - [ ]* 5.4 Write unit tests for enrollment
    - Test successful enrollment with specific deadline values
    - Test duplicate enrollment rejection
    - Test invalid deadline (zero or negative)
    - Test enrollment event emission
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6. Checkpoint - Ensure enrollment tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement claim submission functionality
  - [x] 7.1 Implement submit_claim method
    - Write @app.external method accepting proof_hash parameter
    - Verify caller is enrolled (check enrollment box exists)
    - Verify current timestamp is before claim_deadline
    - Verify no existing claim for farmer (duplicate check)
    - Store Claim in box storage with PENDING status
    - Emit claim submission event
    - Add error handling (ERR_NOT_ENROLLED, ERR_DEADLINE_PASSED, ERR_DUPLICATE_CLAIM, ERR_INVALID_PROOF_HASH)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 13.1, 13.2, 13.4, 15.1_
  
  - [x] 7.2 Implement get_claim query method
    - Write @app.external(read_only=True) method to retrieve claim details
    - Return ClaimDetails with all fields or error if not found
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 7.3 Write property tests for claim submission
    - **Property 5: Claim submission requires enrollment**
    - **Validates: Requirements 3.1, 10.3**
    - **Property 6: Deadline enforcement**
    - **Validates: Requirements 3.2, 3.3, 13.1, 13.2**
    - **Property 7: Proof hash immutability**
    - **Validates: Requirements 3.4, 8.1, 8.2, 8.3**
    - **Property 8: Initial claim status is pending**
    - **Validates: Requirements 3.5**
    - **Property 9: Duplicate claim prevention**
    - **Validates: Requirements 3.6, 4.2, 4.3**
    - Generate random enrolled/non-enrolled farmers
    - Generate random timestamps before/after deadlines
    - Generate random proof hashes
    - Verify all preconditions and postconditions
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 12.4_
  
  - [ ]* 7.4 Write unit tests for claim submission
    - Test successful claim submission with valid proof hash
    - Test rejection when not enrolled
    - Test rejection when deadline passed
    - Test rejection for duplicate claim
    - Test empty proof hash rejection
    - Test claim event emission
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7_

- [x] 8. Implement verifier management functionality
  - [x] 8.1 Implement add_verifier and remove_verifier methods
    - Write @app.external method for add_verifier accepting verifier_address
    - Write @app.external method for remove_verifier accepting verifier_address
    - Verify caller is admin for both methods
    - Store verifier list in box storage with key "verifiers"
    - Implement add logic (append if not exists)
    - Implement remove logic (find and remove)
    - Emit verifier addition/removal events
    - Add error handling (ERR_NOT_ADMIN, ERR_VERIFIER_EXISTS, ERR_VERIFIER_NOT_FOUND)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 10.1, 15.1_
  
  - [x] 8.2 Implement is_verifier query method
    - Write @app.external(read_only=True) method to check verifier authorization
    - Return boolean indicating if address is in verifier list
    - _Requirements: 6.5_
  
  - [ ]* 8.3 Write property tests for verifier management
    - **Property 13: Verifier addition**
    - **Validates: Requirements 6.1**
    - **Property 14: Verifier removal round-trip**
    - **Validates: Requirements 6.2**
    - **Property 15: Admin-only verifier management**
    - **Validates: Requirements 6.3, 10.1**
    - Generate random verifier addresses
    - Generate random non-admin addresses
    - Verify add/remove operations work correctly
    - Verify only admin can manage verifiers
    - _Requirements: 6.1, 6.2, 6.3, 12.4_
  
  - [ ]* 8.4 Write unit tests for verifier management
    - Test admin can add verifier
    - Test admin can remove verifier
    - Test non-admin cannot add/remove verifiers
    - Test duplicate verifier addition rejection
    - Test removing non-existent verifier
    - Test verifier events emission
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9. Implement claim verification functionality
  - [x] 9.1 Implement verify_claim method
    - Write @app.external method accepting farmer_address and approved boolean
    - Verify caller is authorized verifier
    - Verify claim exists and is in PENDING status
    - Update claim status to APPROVED or REJECTED based on approved parameter
    - Record verifier address and verification timestamp
    - Emit verification event
    - Add error handling (ERR_NOT_VERIFIER, ERR_CLAIM_NOT_FOUND, ERR_CLAIM_NOT_PENDING)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.2, 15.1_
  
  - [ ]* 9.2 Write property tests for claim verification
    - **Property 10: Claim status transitions**
    - **Validates: Requirements 5.1, 5.2**
    - **Property 11: Verifier authorization required**
    - **Validates: Requirements 5.3, 10.2**
    - **Property 12: Verification metadata recording**
    - **Validates: Requirements 5.5**
    - Generate random pending claims
    - Generate random authorized/unauthorized verifiers
    - Verify status transitions follow rules
    - Verify only authorized verifiers can verify
    - Verify metadata is recorded correctly
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 12.4_
  
  - [ ]* 9.3 Write unit tests for claim verification
    - Test verifier can approve claim
    - Test verifier can reject claim
    - Test non-verifier cannot verify claim
    - Test cannot verify non-existent claim
    - Test cannot verify already-verified claim
    - Test verification event emission
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 10. Implement claim history and querying
  - [x] 10.1 Implement get_all_claims method with pagination
    - Write @app.external(read_only=True) method accepting offset and limit
    - Iterate through all claim boxes and return list of ClaimDetails
    - Implement pagination logic
    - _Requirements: 14.1, 14.2, 14.4_
  
  - [ ]* 10.2 Write property test for query correctness
    - **Property 16: Claim query correctness**
    - **Validates: Requirements 7.1, 7.2, 14.4**
    - Generate random claims
    - Verify queried data matches stored data for all fields
    - _Requirements: 7.1, 7.2, 12.4_
  
  - [ ]* 10.3 Write unit tests for claim querying
    - Test get_claim returns correct data
    - Test get_claim returns error for non-existent claim
    - Test get_all_claims with pagination
    - Test get_all_claims with empty results
    - _Requirements: 7.1, 7.2, 7.3, 14.1, 14.2_

- [x] 11. Checkpoint - Ensure all smart contract tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Set up frontend project structure and dependencies
  - [x] 12.1 Install Algorand and wallet dependencies
    - Install @algorandfoundation/algokit-utils
    - Install algosdk
    - Install @perawallet/connect
    - Install @tanstack/react-query for data fetching
    - _Requirements: 9.1, 11.6_
  
  - [x] 12.2 Create frontend directory structure
    - Create src/components/ directory
    - Create src/services/ directory
    - Create src/types/ directory
    - Create src/utils/ directory
    - Create src/contexts/ directory for React Context
    - _Requirements: 11.6_
  
  - [x] 12.3 Set up testing infrastructure for frontend
    - Install vitest, @testing-library/react, @testing-library/user-event
    - Install fast-check for property-based testing
    - Create vitest.config.ts
    - Create tests/frontend/unit/ and tests/frontend/properties/ directories
    - _Requirements: 12.3_

- [x] 13. Implement Algorand client and wallet services
  - [x] 13.1 Create Algorand client service
    - Create src/services/algoClient.ts
    - Initialize AlgodClient for TestNet
    - Export configured client instance
    - _Requirements: 9.1_
  
  - [x] 13.2 Create wallet service with Pera Wallet integration
    - Create src/services/walletService.ts
    - Implement WalletService interface (connect, disconnect, getAddress, signTransaction, isConnected)
    - Initialize PeraWalletConnect
    - Implement wallet connection flow
    - Implement wallet disconnection
    - Implement transaction signing
    - Add error handling for wallet connection failures
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 13.3 Create wallet context for state management
    - Create src/contexts/WalletContext.tsx
    - Implement React Context for wallet state (address, connected status)
    - Provide wallet service methods through context
    - _Requirements: 9.2_

- [x] 14. Implement contract service for smart contract interaction
  - [x] 14.1 Define TypeScript types for contract data
    - Create src/types/claim.ts with ClaimStatus enum and Claim interface
    - Create src/types/contract.ts with TransactionResult, ClaimDetails, EnrollmentDetails interfaces
    - _Requirements: 7.1, 7.2_
  
  - [x] 14.2 Create contract service
    - Create src/services/contractService.ts
    - Implement ContractService interface with all methods (enrollFarmer, submitClaim, verifyClaim, addVerifier, removeVerifier, getClaim, getEnrollment, isVerifier, getAllClaims)
    - Implement transaction composition using algosdk
    - Implement transaction signing using wallet service
    - Implement transaction submission to network
    - Implement contract state querying
    - Add error handling and parsing for contract errors
    - _Requirements: 3.1, 3.2, 5.1, 6.1, 6.2, 7.1, 14.1_
  
  - [x] 14.3 Create error handler utility
    - Create src/utils/errorHandler.ts
    - Implement parseContractError function with error code mapping
    - Map all contract error codes to user-friendly messages
    - Handle Algorand-specific errors (insufficient balance, user rejection)
    - Implement error logging
    - _Requirements: 15.1, 15.2, 15.3, 15.5_
  
  - [x] 14.4 Create data formatter utility
    - Create src/utils/formatters.ts
    - Implement functions for formatting timestamps, addresses, claim status
    - Implement functions for calculating days until deadline
    - _Requirements: 7.4_

- [x] 15. Implement wallet connection UI component
  - [x] 15.1 Create WalletConnect component
    - Create src/components/WalletConnect.tsx
    - Display "Connect Wallet" button when disconnected
    - Display connected address when connected
    - Display "Disconnect" button when connected
    - Use wallet context for state and methods
    - Show error messages for connection failures
    - _Requirements: 9.2, 9.4, 9.5_
  
  - [ ]* 15.2 Write unit tests for WalletConnect component
    - Test component renders connect button when disconnected
    - Test component renders address when connected
    - Test connect button triggers wallet connection
    - Test disconnect button triggers wallet disconnection
    - Test error message display
    - _Requirements: 9.2, 9.4, 9.5_

- [x] 16. Implement farmer enrollment UI component
  - [x] 16.1 Create EnrollmentForm component
    - Create src/components/EnrollmentForm.tsx
    - Create form with deadline_days input field
    - Implement input validation (must be > 0)
    - Call contractService.enrollFarmer on form submission
    - Display transaction status (pending, success, error)
    - Show enrollment details after successful enrollment
    - Display user-friendly error messages
    - _Requirements: 11.1, 15.2_
  
  - [ ]* 16.2 Write unit tests for EnrollmentForm component
    - Test form renders correctly
    - Test input validation
    - Test form submission calls contract service
    - Test success message display
    - Test error message display
    - _Requirements: 11.1, 11.5_

- [x] 17. Implement claim submission UI component
  - [x] 17.1 Create ClaimSubmission component
    - Create src/components/ClaimSubmission.tsx
    - Create form with proof_hash input field
    - Implement input validation (non-empty, reasonable length)
    - Check enrollment status before allowing submission
    - Check deadline before allowing submission
    - Call contractService.submitClaim on form submission
    - Display transaction status (pending, success, error)
    - Show claim details after successful submission
    - Display user-friendly error messages
    - _Requirements: 11.2, 15.2_
  
  - [ ]* 17.2 Write unit tests for ClaimSubmission component
    - Test form renders correctly
    - Test input validation
    - Test enrollment check
    - Test deadline check
    - Test form submission calls contract service
    - Test success message display
    - Test error message display
    - _Requirements: 11.2, 11.5_

- [x] 18. Implement claim verification UI component
  - [x] 18.1 Create ClaimVerification component
    - Create src/components/ClaimVerification.tsx
    - Fetch and display list of pending claims using contractService.getAllClaims
    - Filter claims to show only PENDING status
    - Display claim details (farmer address, proof hash, submission timestamp)
    - Provide "Approve" and "Reject" buttons for each claim
    - Call contractService.verifyClaim on button click
    - Display transaction status (pending, success, error)
    - Refresh claim list after successful verification
    - Only render component if user is a verifier
    - Display user-friendly error messages
    - _Requirements: 11.3, 15.2_
  
  - [ ]* 18.2 Write unit tests for ClaimVerification component
    - Test component renders pending claims
    - Test approve button calls contract service with approved=true
    - Test reject button calls contract service with approved=false
    - Test component only renders for verifiers
    - Test claim list refresh after verification
    - Test error message display
    - _Requirements: 11.3, 11.5_

- [x] 19. Implement verifier management UI component
  - [x] 19.1 Create VerifierManagement component
    - Create src/components/VerifierManagement.tsx
    - Create form with verifier_address input field for adding verifiers
    - Implement address validation (Algorand address format)
    - Call contractService.addVerifier on add button click
    - Display list of current verifiers
    - Provide "Remove" button for each verifier
    - Call contractService.removeVerifier on remove button click
    - Display transaction status (pending, success, error)
    - Only render component if user is admin
    - Display user-friendly error messages
    - _Requirements: 11.4, 15.2_
  
  - [ ]* 19.2 Write unit tests for VerifierManagement component
    - Test form renders correctly
    - Test address validation
    - Test add button calls contract service
    - Test remove button calls contract service
    - Test component only renders for admin
    - Test verifier list display
    - Test error message display
    - _Requirements: 11.4, 11.5_

- [x] 20. Implement claim status and history UI components
  - [x] 20.1 Create ClaimStatus component
    - Create src/components/ClaimStatus.tsx
    - Accept farmer address as prop
    - Fetch claim details using contractService.getClaim
    - Display all claim fields (proof hash, status, timestamps, verifier)
    - Display enrollment details (enrollment timestamp, deadline)
    - Calculate and display days until deadline or "Expired" if past
    - Display status with color coding (pending=yellow, approved=green, rejected=red)
    - _Requirements: 7.4_
  
  - [x] 20.2 Create ClaimHistory component
    - Create src/components/ClaimHistory.tsx
    - Fetch all claims using contractService.getAllClaims with pagination
    - Display claims in a table or list format
    - Implement filtering by status (all, pending, approved, rejected)
    - Display claim details for each claim
    - Implement pagination controls (next, previous, page numbers)
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 20.3 Write unit tests for claim status and history components
    - Test ClaimStatus displays claim details correctly
    - Test ClaimStatus calculates deadline correctly
    - Test ClaimHistory displays claims list
    - Test ClaimHistory filtering works
    - Test ClaimHistory pagination works
    - _Requirements: 7.4, 14.1, 14.2, 14.3_

- [x] 21. Integrate all components into main App
  - [x] 21.1 Update App.tsx with AgriProof UI
    - Clear boilerplate content from src/App.tsx
    - Wrap app with WalletContext provider
    - Wrap app with React Query provider
    - Add WalletConnect component at top
    - Add role-based component rendering (show EnrollmentForm for all, ClaimSubmission for enrolled farmers, ClaimVerification for verifiers, VerifierManagement for admin)
    - Add ClaimHistory component for all users
    - Implement basic layout and navigation
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 21.2 Update index.css with AgriProof styles
    - Replace boilerplate styles with clean, minimal styles
    - Add styles for forms, buttons, tables, status indicators
    - Implement responsive design for mobile and desktop
    - Add color coding for claim statuses
    - _Requirements: 11.6_

- [x] 22. Checkpoint - Ensure frontend builds and runs
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 23. Write frontend property-based tests
  - [ ]* 23.1 Write property test for error handling
    - Create tests/frontend/properties/errorHandling.test.ts
    - Generate random error codes and messages
    - Verify parseContractError returns correct user-friendly messages
    - _Requirements: 15.2_
  
  - [ ]* 23.2 Write property test for data formatting
    - Create tests/frontend/properties/dataFormatting.test.ts
    - Generate random timestamps and addresses
    - Verify formatting functions produce correct output
    - _Requirements: 7.4_

- [x] 24. Create deployment configuration and documentation
  - [x] 24.1 Create smart contract deployment script
    - Create smart_contracts/deploy.py
    - Implement deployment to AlgoKit LocalNet for testing
    - Implement deployment to Algorand TestNet
    - Store deployed contract app ID in configuration file
    - _Requirements: 1.1_
  
  - [x] 24.2 Update frontend with deployed contract configuration
    - Create src/config/contract.ts
    - Store contract app ID for TestNet
    - Export contract configuration for use in contract service
    - _Requirements: 1.1_
  
  - [x] 24.3 Update README with setup and deployment instructions
    - Document prerequisites (AlgoKit, Node.js, Python)
    - Document smart contract deployment steps
    - Document frontend setup and run steps
    - Document testing instructions
    - Document environment variables needed
    - _Requirements: 12.2_

- [ ] 25. Final checkpoint - End-to-end validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: data models → smart contract logic → frontend services → UI components → integration
- Smart contract is built first to establish the core business logic, then frontend is built to interact with it
- All code should be production-ready with proper error handling and validation
