/**
 * ClaimHistory Component
 * 
 * Displays a paginated list of all claims with filtering by status
 */

import { useEffect, useState } from 'react';
import { contractService } from '../services/contractService';
import type { Claim } from '../types/claim';
import { ClaimStatus } from '../types/claim';
import { 
  formatTimestamp, 
  formatAddress, 
  formatClaimStatus, 
  getStatusColor,
  formatProofHash
} from '../utils/formatters';

const ITEMS_PER_PAGE = 10;

type FilterStatus = 'all' | ClaimStatus;

export function ClaimHistory() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [claims, filterStatus]);

  async function loadClaims() {
    try {
      setLoading(true);
      setError(null);

      const allClaims = await contractService.getAllClaims();
      setClaims(allClaims);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  }

  function applyFilter() {
    if (filterStatus === 'all') {
      setFilteredClaims(claims);
    } else {
      setFilteredClaims(claims.filter(claim => claim.status === filterStatus));
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }

  function handleFilterChange(status: FilterStatus) {
    setFilterStatus(status);
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredClaims.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClaims = filteredClaims.slice(startIndex, endIndex);

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  function goToPreviousPage() {
    goToPage(currentPage - 1);
  }

  function goToNextPage() {
    goToPage(currentPage + 1);
  }

  if (loading) {
    return (
      <div className="claim-history loading">
        <p>Loading claim history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="claim-history error">
        <p className="error-message">{error}</p>
        <button onClick={loadClaims}>Retry</button>
      </div>
    );
  }

  return (
    <div className="claim-history">
      <h2>Claim History</h2>

      {/* Filter Controls */}
      <div className="filter-controls">
        <label>Filter by status:</label>
        <div className="filter-buttons">
          <button
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => handleFilterChange('all')}
          >
            All ({claims.length})
          </button>
          <button
            className={filterStatus === ClaimStatus.PENDING ? 'active' : ''}
            onClick={() => handleFilterChange(ClaimStatus.PENDING)}
          >
            Pending ({claims.filter(c => c.status === ClaimStatus.PENDING).length})
          </button>
          <button
            className={filterStatus === ClaimStatus.APPROVED ? 'active' : ''}
            onClick={() => handleFilterChange(ClaimStatus.APPROVED)}
          >
            Approved ({claims.filter(c => c.status === ClaimStatus.APPROVED).length})
          </button>
          <button
            className={filterStatus === ClaimStatus.REJECTED ? 'active' : ''}
            onClick={() => handleFilterChange(ClaimStatus.REJECTED)}
          >
            Rejected ({claims.filter(c => c.status === ClaimStatus.REJECTED).length})
          </button>
        </div>
      </div>

      {/* Claims Table */}
      {filteredClaims.length === 0 ? (
        <div className="no-claims">
          <p>No claims found.</p>
        </div>
      ) : (
        <>
          <div className="claims-table">
            <table>
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Proof Hash</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Verifier</th>
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {currentClaims.map((claim) => (
                  <tr key={claim.farmerAddress}>
                    <td title={claim.farmerAddress}>
                      {formatAddress(claim.farmerAddress, 6)}
                    </td>
                    <td title={claim.proofHash}>
                      {formatProofHash(claim.proofHash, 20)}
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(claim.status) }}
                      >
                        {formatClaimStatus(claim.status)}
                      </span>
                    </td>
                    <td>{formatTimestamp(claim.submissionTimestamp)}</td>
                    <td title={claim.verifierAddress || ''}>
                      {claim.verifierAddress 
                        ? formatAddress(claim.verifierAddress, 6)
                        : '-'
                      }
                    </td>
                    <td>
                      {claim.verificationTimestamp 
                        ? formatTimestamp(claim.verificationTimestamp)
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>

              <span className="page-info">
                Page {currentPage} of {totalPages} ({filteredClaims.length} claims)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
