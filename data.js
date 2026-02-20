// Shared data management using localStorage

function initData() {
    if (!localStorage.getItem('agriproof_claims')) {
        localStorage.setItem('agriproof_claims', JSON.stringify([]));
    }
    if (!localStorage.getItem('agriproof_verifiers')) {
        localStorage.setItem('agriproof_verifiers', JSON.stringify([
            'VERIF1ABC123XYZ789DEF456GHI789JKL012MNO345PQR678STU901',
            'VERIF2DEF456ABC789GHI012JKL345MNO678PQR901STU234VWX567'
        ]));
    }
    if (!localStorage.getItem('agriproof_farmers')) {
        localStorage.setItem('agriproof_farmers', JSON.stringify([]));
    }
    if (!localStorage.getItem('agriproof_admin')) {
        // Default admin address
        localStorage.setItem('agriproof_admin', 'ADMIN1ABC123XYZ789DEF456GHI789JKL012MNO345PQR678STU901');
    }
}

function getAdmin() {
    initData();
    return localStorage.getItem('agriproof_admin');
}

function setAdmin(address) {
    localStorage.setItem('agriproof_admin', address);
}

function isAdmin(address) {
    return address === getAdmin();
}

function getClaims() {
    initData();
    return JSON.parse(localStorage.getItem('agriproof_claims'));
}

function saveClaim(claim) {
    const claims = getClaims();
    claim.id = claims.length + 1;
    claim.timestamp = new Date().toISOString();
    claims.push(claim);
    localStorage.setItem('agriproof_claims', JSON.stringify(claims));
    return claim;
}

function updateClaim(id, updates) {
    const claims = getClaims();
    const index = claims.findIndex(c => c.id === id);
    if (index !== -1) {
        claims[index] = { ...claims[index], ...updates };
        localStorage.setItem('agriproof_claims', JSON.stringify(claims));
        return claims[index];
    }
    return null;
}

function getVerifiers() {
    initData();
    return JSON.parse(localStorage.getItem('agriproof_verifiers'));
}

function addVerifier(address) {
    const verifiers = getVerifiers();
    if (!verifiers.includes(address)) {
        verifiers.push(address);
        localStorage.setItem('agriproof_verifiers', JSON.stringify(verifiers));
    }
}

function removeVerifier(address) {
    let verifiers = getVerifiers();
    verifiers = verifiers.filter(v => v !== address);
    localStorage.setItem('agriproof_verifiers', JSON.stringify(verifiers));
}

function isVerifier(address) {
    return getVerifiers().includes(address);
}

function getFarmers() {
    initData();
    return JSON.parse(localStorage.getItem('agriproof_farmers'));
}

function enrollFarmer(address, deadline) {
    const farmers = getFarmers();
    const farmer = {
        address: address,
        enrolledAt: new Date().toISOString(),
        deadline: deadline
    };
    farmers.push(farmer);
    localStorage.setItem('agriproof_farmers', JSON.stringify(farmers));
    return farmer;
}

function getStats() {
    const claims = getClaims();
    const farmers = getFarmers();
    return {
        total: claims.length,
        pending: claims.filter(c => c.status === 'pending').length,
        approved: claims.filter(c => c.status === 'approved').length,
        rejected: claims.filter(c => c.status === 'rejected').length,
        farmers: farmers.length
    };
}

function formatAddress(addr) {
    if (!addr) return '';
    return addr.substring(0, 8) + '...' + addr.substring(addr.length - 6);
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

// Initialize on load
initData();
