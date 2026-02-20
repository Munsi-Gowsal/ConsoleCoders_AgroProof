/**
 * AgriProof Main Application
 * 
 * Integrates all components with role-based rendering
 */

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import { WalletConnect } from './components/WalletConnect';
import { EnrollmentForm } from './components/EnrollmentForm';
import { ClaimSubmission } from './components/ClaimSubmission';
import { ClaimVerification } from './components/ClaimVerification';
import { VerifierManagement } from './components/VerifierManagement';
import { ClaimHistory } from './components/ClaimHistory';
import { contractService } from './services/contractService';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { address, isConnected } = useWallet();
  const [isVerifier, setIsVerifier] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check user roles when wallet is connected
  useEffect(() => {
    async function checkRoles() {
      if (!address) {
        setIsVerifier(false);
        setIsAdmin(false);
        setIsEnrolled(false);
        return;
      }

      setLoading(true);
      try {
        // Check if user is admin
        const adminAddress = await contractService.getAdmin();
        setIsAdmin(adminAddress === address);

        // Check if user is verifier
        const verifierStatus = await contractService.isVerifier(address);
        setIsVerifier(verifierStatus);

        // Check if user is enrolled
        const enrollment = await contractService.getEnrollment(address);
        setIsEnrolled(enrollment !== null);
      } catch (error) {
        console.error('Failed to check user roles:', error);
      } finally {
        setLoading(false);
      }
    }

    checkRoles();
  }, [address]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ 
        padding: '24px 0', 
        borderBottom: '2px solid #e5e5e5',
        marginBottom: '32px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          🌾 AgriProof
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          On-Chain Agricultural Claim Registry
        </p>
      </header>

      {/* Wallet Connection */}
      <WalletConnect />

      {/* Main Content - Only show if wallet is connected */}
      {isConnected && !loading && (
        <>
          {/* Admin Section */}
          {isAdmin && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                marginBottom: '16px',
                color: '#4f46e5'
              }}>
                Admin Controls
              </h2>
              <VerifierManagement />
            </section>
          )}

          {/* Verifier Section */}
          {isVerifier && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                marginBottom: '16px',
                color: '#10b981'
              }}>
                Claim Verification
              </h2>
              <ClaimVerification />
            </section>
          )}

          {/* Farmer Section */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600',
              marginBottom: '16px',
              color: '#f59e0b'
            }}>
              Farmer Portal
            </h2>
            
            {/* Enrollment Form - Always visible */}
            <EnrollmentForm />

            {/* Claim Submission - Only for enrolled farmers */}
            {isEnrolled && <ClaimSubmission />}
          </section>

          {/* Claim History - Visible to all connected users */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600',
              marginBottom: '16px',
              color: '#333'
            }}>
              Claim History
            </h2>
            <ClaimHistory />
          </section>
        </>
      )}

      {/* Loading State */}
      {isConnected && loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          Loading user roles...
        </div>
      )}

      {/* Not Connected State */}
      {!isConnected && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginTop: '32px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '16px',
            color: '#333'
          }}>
            Welcome to AgriProof
          </h2>
          <p style={{ 
            color: '#666',
            fontSize: '16px',
            marginBottom: '24px'
          }}>
            Connect your Pera Wallet to get started with the agricultural claim registry system.
          </p>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#e0f2fe',
            borderRadius: '6px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h3 style={{ 
              fontSize: '18px',
              marginBottom: '12px',
              color: '#0c4a6e'
            }}>
              Features:
            </h3>
            <ul style={{ 
              textAlign: 'left',
              color: '#0c4a6e',
              lineHeight: '1.8'
            }}>
              <li>🌱 Enroll as a farmer to submit crop damage claims</li>
              <li>📝 Submit claims with cryptographic proof hashes</li>
              <li>✅ Verifiers can approve or reject claims</li>
              <li>👑 Admins can manage verifier permissions</li>
              <li>📊 View complete claim history with filtering</li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ 
        marginTop: '64px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e5e5',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px'
      }}>
        <p>Built on Algorand Blockchain • Powered by AlgoKit & Beaker</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
