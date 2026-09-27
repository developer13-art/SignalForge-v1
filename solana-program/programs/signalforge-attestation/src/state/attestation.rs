//! Individual attestation state.

use anchor_lang::prelude::*;

/// The kind of attestation being recorded.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum AttestationKind {
    /// Provider certification level and quality score.
    Certification,

    /// Provider DNA confidence score.
    Dna,

    /// Provider reputation record.
    Reputation,

    /// Any other verifiable public record.
    Other,
}

/// Status of the attestation lifecycle.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum AttestationStatus {
    Active,
    Revoked,
    Expired,
}

/// A single attestation record.
#[account]
#[derive(Debug)]
pub struct Attestation {
    /// The subject the attestation is about (usually a provider's on-chain
    /// identity pubkey, but may be any public reference).
    pub subject: Pubkey,

    /// Public, human-readable reference to the subject (e.g. "SF-2841").
    pub subject_reference: String,

    /// Kind of attestation.
    pub kind: AttestationKind,

    /// SHA-256 hash of the off-chain payload.
    pub payload_hash: [u8; 32],

    /// Monotonically increasing version of this attestation.
    pub version: u16,

    /// Metadata URI (e.g. IPFS, HTTPS).
    pub metadata_uri: String,

    /// Unix timestamp when the attestation was created.
    pub created_at: i64,

    /// Unix timestamp of the most recent update.
    pub updated_at: i64,

    /// Unix timestamp when the attestation expires (0 = never).
    pub expires_at: i64,

    /// Whether the attestation has been revoked.
    pub revoked: bool,

    /// Reason for revocation (empty if not revoked).
    pub revocation_reason: String,

    /// Unix timestamp of revocation (0 if not revoked).
    pub revoked_at: i64,

    /// The authority that issued the attestation.
    pub authority: Pubkey,

    /// Bump seed for the attestation PDA.
    pub bump: u8,
}

impl Attestation {
    pub const MAX_SIZE: usize = 8  // discriminator
        + 32                       // subject
        + 4 + crate::constants::MAX_SUBJECT_REFERENCE_LEN
        + 1                        // kind
        + 32                       // payload_hash
        + 2                        // version
        + 4 + crate::constants::MAX_METADATA_URI_LEN
        + 8                        // created_at
        + 8                        // updated_at
        + 8                        // expires_at
        + 1                        // revoked
        + 4 + crate::constants::MAX_REVOCATION_REASON_LEN
        + 8                        // revoked_at
        + 32                       // authority
        + 1;                       // bump

    /// Return the current lifecycle status.
    pub fn status(&self, now: i64) -> AttestationStatus {
        if self.revoked {
            AttestationStatus::Revoked
        } else if self.expires_at > 0 && now > self.expires_at {
            AttestationStatus::Expired
        } else {
            AttestationStatus::Active
        }
    }

    /// Verify the payload hash matches an expected value.
    pub fn verify_payload(&self, expected: &[u8; 32]) -> bool {
        self.payload_hash == *expected && !self.revoked
    }
}