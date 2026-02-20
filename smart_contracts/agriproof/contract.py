"""
AgriProof Agricultural Claim Registry Smart Contract

A decentralized agricultural claim registry system built on Algorand blockchain.
Enables farmers to submit crop damage claims, verifiers to approve them, and
administrators to manage the system.
"""

from algopy import (
    ARC4Contract,
    GlobalState,
    String,
    UInt64,
    Bytes,
    Txn,
    Global,
    BoxRef,
    op,
    arc4,
    subroutine,
)


# Error codes
ERR_ALREADY_ENROLLED = "ERR_ALREADY_ENROLLED"
ERR_INVALID_DEADLINE = "ERR_INVALID_DEADLINE"
ERR_NOT_ENROLLED = "ERR_NOT_ENROLLED"
ERR_DEADLINE_PASSED = "ERR_DEADLINE_PASSED"
ERR_DUPLICATE_CLAIM = "ERR_DUPLICATE_CLAIM"
ERR_INVALID_PROOF_HASH = "ERR_INVALID_PROOF_HASH"
ERR_NOT_VERIFIER = "ERR_NOT_VERIFIER"
ERR_CLAIM_NOT_FOUND = "ERR_CLAIM_NOT_FOUND"
ERR_CLAIM_NOT_PENDING = "ERR_CLAIM_NOT_PENDING"
ERR_NOT_ADMIN = "ERR_NOT_ADMIN"
ERR_VERIFIER_EXISTS = "ERR_VERIFIER_EXISTS"
ERR_VERIFIER_NOT_FOUND = "ERR_VERIFIER_NOT_FOUND"
ERR_ENROLLMENT_NOT_FOUND = "ERR_ENROLLMENT_NOT_FOUND"

# Constants
SECONDS_PER_DAY = UInt64(86400)


class ClaimStatus(arc4.UInt8):
    """Claim status enumeration"""
    PENDING = arc4.UInt8(0)
    APPROVED = arc4.UInt8(1)
    REJECTED = arc4.UInt8(2)


class Claim(arc4.Struct):
    """Claim data structure stored in box storage"""
    proof_hash: arc4.String
    status: arc4.UInt8
    submission_timestamp: arc4.UInt64
    verifier_address: arc4.Address
    verification_timestamp: arc4.UInt64


class Enrollment(arc4.Struct):
    """Enrollment data structure stored in box storage"""
    enrollment_timestamp: arc4.UInt64
    claim_deadline: arc4.UInt64


class ClaimDetails(arc4.Struct):
    """Claim details for query responses"""
    farmer_address: arc4.Address
    proof_hash: arc4.String
    status: arc4.UInt8
    submission_timestamp: arc4.UInt64
    verifier_address: arc4.Address
    verification_timestamp: arc4.UInt64


class EnrollmentDetails(arc4.Struct):
    """Enrollment details for query responses"""
    farmer_address: arc4.Address
    enrollment_timestamp: arc4.UInt64
    claim_deadline: arc4.UInt64


class AgriProofContract(ARC4Contract):
    """
    AgriProof Agricultural Claim Registry Smart Contract
    
    Manages farmer enrollments, claim submissions, and verifications
    with role-based access control.
    """
    
    def __init__(self) -> None:
        """Initialize contract state"""
        self.admin = GlobalState(Bytes)
    
    @arc4.abimethod(create="require")
    def create(self) -> None:
        """
        Initialize the smart contract.
        Sets the deployer as admin.
        """
        self.admin.value = Txn.sender.bytes
    
    @arc4.abimethod
    def enroll_farmer(self, deadline_days: arc4.UInt64) -> None:
        """
        Enroll a farmer in the system.
        
        Args:
            deadline_days: Number of days from now until claim deadline
            
        Raises:
            ERR_ALREADY_ENROLLED: If farmer is already enrolled
            ERR_INVALID_DEADLINE: If deadline_days is zero
        """
        # Validate deadline
        assert deadline_days.native > 0, ERR_INVALID_DEADLINE
        
        # Check for duplicate enrollment
        enrollment_key = b"enrollment_" + Txn.sender.bytes
        enrollment_box = BoxRef(key=enrollment_key)
        assert not enrollment_box.exists, ERR_ALREADY_ENROLLED
        
        # Calculate deadline
        enrollment_timestamp = Global.latest_timestamp
        claim_deadline = enrollment_timestamp + (deadline_days.native * SECONDS_PER_DAY)
        
        # Store enrollment
        enrollment = Enrollment(
            enrollment_timestamp=arc4.UInt64(enrollment_timestamp),
            claim_deadline=arc4.UInt64(claim_deadline)
        )
        enrollment_box.create(size=enrollment.bytes.length)
        enrollment_box.put(enrollment.bytes)
        
        # Emit event
        arc4.emit("FarmerEnrolled", Txn.sender, claim_deadline)
    
    @arc4.abimethod
    def submit_claim(self, proof_hash: arc4.String) -> None:
        """
        Submit a crop damage claim.
        
        Args:
            proof_hash: Cryptographic hash of damage evidence
            
        Raises:
            ERR_NOT_ENROLLED: If caller is not enrolled
            ERR_DEADLINE_PASSED: If claim deadline has passed
            ERR_DUPLICATE_CLAIM: If farmer already has a claim
            ERR_INVALID_PROOF_HASH: If proof hash is empty
        """
        # Validate proof hash
        assert proof_hash.native != "", ERR_INVALID_PROOF_HASH
        
        # Check enrollment
        enrollment_key = b"enrollment_" + Txn.sender.bytes
        enrollment_box = BoxRef(key=enrollment_key)
        assert enrollment_box.exists, ERR_NOT_ENROLLED
        
        # Get enrollment and check deadline
        enrollment = Enrollment.from_bytes(enrollment_box.get())
        current_time = Global.latest_timestamp
        assert current_time < enrollment.claim_deadline.native, ERR_DEADLINE_PASSED
        
        # Check for duplicate claim
        claim_key = b"claim_" + Txn.sender.bytes
        claim_box = BoxRef(key=claim_key)
        assert not claim_box.exists, ERR_DUPLICATE_CLAIM
        
        # Store claim
        claim = Claim(
            proof_hash=proof_hash,
            status=arc4.UInt8(0),  # PENDING
            submission_timestamp=arc4.UInt64(current_time),
            verifier_address=arc4.Address(),  # Zero address
            verification_timestamp=arc4.UInt64(0)
        )
        claim_box.create(size=claim.bytes.length)
        claim_box.put(claim.bytes)
        
        # Emit event
        arc4.emit("ClaimSubmitted", Txn.sender, proof_hash)
    
    @arc4.abimethod
    def verify_claim(self, farmer_address: arc4.Address, approved: arc4.Bool) -> None:
        """
        Approve or reject a claim.
        
        Args:
            farmer_address: Address of farmer whose claim to verify
            approved: True to approve, False to reject
            
        Raises:
            ERR_NOT_VERIFIER: If caller is not authorized verifier
            ERR_CLAIM_NOT_FOUND: If claim doesn't exist
            ERR_CLAIM_NOT_PENDING: If claim is not in pending status
        """
        # Check verifier authorization
        assert self._is_verifier(Txn.sender), ERR_NOT_VERIFIER
        
        # Get claim
        claim_key = b"claim_" + farmer_address.native.bytes
        claim_box = BoxRef(key=claim_key)
        assert claim_box.exists, ERR_CLAIM_NOT_FOUND
        
        # Parse claim and check status
        claim = Claim.from_bytes(claim_box.get())
        assert claim.status.native == 0, ERR_CLAIM_NOT_PENDING  # PENDING
        
        # Update claim
        new_status = arc4.UInt8(1) if approved.native else arc4.UInt8(2)  # APPROVED or REJECTED
        updated_claim = Claim(
            proof_hash=claim.proof_hash,
            status=new_status,
            submission_timestamp=claim.submission_timestamp,
            verifier_address=arc4.Address(Txn.sender),
            verification_timestamp=arc4.UInt64(Global.latest_timestamp)
        )
        claim_box.put(updated_claim.bytes)
        
        # Emit event
        arc4.emit("ClaimVerified", farmer_address, new_status, Txn.sender)
    
    @arc4.abimethod
    def add_verifier(self, verifier_address: arc4.Address) -> None:
        """
        Add a new verifier to the authorized list.
        
        Args:
            verifier_address: Address to add as verifier
            
        Raises:
            ERR_NOT_ADMIN: If caller is not admin
            ERR_VERIFIER_EXISTS: If verifier already exists
        """
        # Check admin
        assert Txn.sender.bytes == self.admin.value, ERR_NOT_ADMIN
        
        # Get or create verifier list
        verifiers_box = BoxRef(key=b"verifiers")
        
        if verifiers_box.exists:
            verifiers_bytes = verifiers_box.get()
            # Check if verifier already exists
            if self._verifier_in_list(verifiers_bytes, verifier_address.native.bytes):
                assert False, ERR_VERIFIER_EXISTS
            # Append verifier
            new_verifiers = verifiers_bytes + verifier_address.native.bytes
            verifiers_box.put(new_verifiers)
        else:
            # Create new list with first verifier
            verifiers_box.create(size=32)
            verifiers_box.put(verifier_address.native.bytes)
        
        # Emit event
        arc4.emit("VerifierAdded", verifier_address)
    
    @arc4.abimethod
    def remove_verifier(self, verifier_address: arc4.Address) -> None:
        """
        Remove a verifier from the authorized list.
        
        Args:
            verifier_address: Address to remove from verifiers
            
        Raises:
            ERR_NOT_ADMIN: If caller is not admin
            ERR_VERIFIER_NOT_FOUND: If verifier doesn't exist
        """
        # Check admin
        assert Txn.sender.bytes == self.admin.value, ERR_NOT_ADMIN
        
        # Get verifier list
        verifiers_box = BoxRef(key=b"verifiers")
        assert verifiers_box.exists, ERR_VERIFIER_NOT_FOUND
        
        verifiers_bytes = verifiers_box.get()
        new_verifiers = self._remove_from_list(verifiers_bytes, verifier_address.native.bytes)
        
        assert len(new_verifiers) < len(verifiers_bytes), ERR_VERIFIER_NOT_FOUND
        
        if len(new_verifiers) == 0:
            verifiers_box.delete()
        else:
            verifiers_box.put(new_verifiers)
        
        # Emit event
        arc4.emit("VerifierRemoved", verifier_address)
    
    @arc4.abimethod(readonly=True)
    def get_claim(self, farmer_address: arc4.Address) -> ClaimDetails:
        """
        Retrieve claim details for a farmer.
        
        Args:
            farmer_address: Address of farmer
            
        Returns:
            ClaimDetails with all claim fields
            
        Raises:
            ERR_CLAIM_NOT_FOUND: If claim doesn't exist
        """
        claim_key = b"claim_" + farmer_address.native.bytes
        claim_box = BoxRef(key=claim_key)
        assert claim_box.exists, ERR_CLAIM_NOT_FOUND
        
        claim = Claim.from_bytes(claim_box.get())
        
        return ClaimDetails(
            farmer_address=farmer_address,
            proof_hash=claim.proof_hash,
            status=claim.status,
            submission_timestamp=claim.submission_timestamp,
            verifier_address=claim.verifier_address,
            verification_timestamp=claim.verification_timestamp
        )
    
    @arc4.abimethod(readonly=True)
    def get_enrollment(self, farmer_address: arc4.Address) -> EnrollmentDetails:
        """
        Retrieve enrollment details for a farmer.
        
        Args:
            farmer_address: Address of farmer
            
        Returns:
            EnrollmentDetails with enrollment timestamp and deadline
            
        Raises:
            ERR_ENROLLMENT_NOT_FOUND: If enrollment doesn't exist
        """
        enrollment_key = b"enrollment_" + farmer_address.native.bytes
        enrollment_box = BoxRef(key=enrollment_key)
        assert enrollment_box.exists, ERR_ENROLLMENT_NOT_FOUND
        
        enrollment = Enrollment.from_bytes(enrollment_box.get())
        
        return EnrollmentDetails(
            farmer_address=farmer_address,
            enrollment_timestamp=enrollment.enrollment_timestamp,
            claim_deadline=enrollment.claim_deadline
        )
    
    @arc4.abimethod(readonly=True)
    def is_verifier(self, address: arc4.Address) -> arc4.Bool:
        """
        Check if an address is an authorized verifier.
        
        Args:
            address: Address to check
            
        Returns:
            True if address is a verifier, False otherwise
        """
        return arc4.Bool(self._is_verifier(address))
    
    @arc4.abimethod(readonly=True)
    def get_admin(self) -> arc4.Address:
        """
        Get the admin address.
        
        Returns:
            Admin address
        """
        return arc4.Address(self.admin.value)
    
    @subroutine
    def _is_verifier(self, address: arc4.Address | Bytes) -> bool:
        """Internal helper to check verifier status"""
        verifiers_box = BoxRef(key=b"verifiers")
        if not verifiers_box.exists:
            return False
        
        verifiers_bytes = verifiers_box.get()
        address_bytes = address.native.bytes if isinstance(address, arc4.Address) else address
        return self._verifier_in_list(verifiers_bytes, address_bytes)
    
    @subroutine
    def _verifier_in_list(self, verifiers_bytes: Bytes, address_bytes: Bytes) -> bool:
        """Check if address is in verifier list"""
        # Each address is 32 bytes
        num_verifiers = len(verifiers_bytes) // 32
        for i in range(num_verifiers):
            start = i * 32
            end = start + 32
            if op.extract(verifiers_bytes, start, 32) == address_bytes:
                return True
        return False
    
    @subroutine
    def _remove_from_list(self, verifiers_bytes: Bytes, address_bytes: Bytes) -> Bytes:
        """Remove address from verifier list"""
        result = Bytes(b"")
        num_verifiers = len(verifiers_bytes) // 32
        
        for i in range(num_verifiers):
            start = i * 32
            verifier = op.extract(verifiers_bytes, start, 32)
            if verifier != address_bytes:
                result = result + verifier
        
        return result
