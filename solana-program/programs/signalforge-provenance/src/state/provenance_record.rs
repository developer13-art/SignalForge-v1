//! Provenance record state.

use anchor_lang::prelude::*;

/// A single AI processing provenance record.
#[account]
#[derive(Debug)]
pub struct ProvenanceRecord {
    /// Public, human-readable signal identifier (e.g. "SF-sig-9a8f4c2e").
    pub signal_reference: String,

    /// SHA-256 hash of the AI processing record.
    pub processing_hash: [u8; 32],

    /// AI model version used to process the signal.
    pub ai_version: String,

    /// Processing pipeline version.
    pub processing_version: String,

    /// Metadata URI (e.g. IPFS, HTTPS).
    pub metadata_uri: String,

    /// The authority that anchored the record.
    pub authority: Pubkey,

    /// Solana slot at anchor time.
    pub anchored_slot: u64,

    /// Unix timestamp at anchor time.
    pub anchored_at: i64,

    /// Whether the record has been revoked.
    pub revoked: bool,

    /// Reason for revocation (empty if not revoked).
    pub revocation_reason: String,

    /// Unix timestamp of revocation (0 if not revoked).
    pub revoked_at: i64,

    /// Bump seed for the record PDA.
    pub bump: u8,
}

impl ProvenanceRecord {
    pub const MAX_SIZE: usize = 8  // discriminator
        + 4 + crate::constants::MAX_SIGNAL_REFERENCE_LEN
        + 32
        + 4 + crate::constants::MAX_AI_VERSION_LEN
        + 4 + crate::constants::MAX_PROCESSING_VERSION_LEN
        + 4 + crate::constants::MAX_METADATA_URI_LEN
        + 32
        + 8
        + 8
        + 1
        + 4 + 200  // revocation_reason max
        + 8
        + 1;

    /// Verify the processing hash matches an expected hash and the record
    /// has not been revoked.
    pub fn verify(&self, expected: &[u8; 32]) -> bool {
        !self.revoked && self.processing_hash == *expected
    }
}

/// Global provenance authority state.
#[account]
#[derive(Debug)]
pub struct ProvenanceAuthority {
    pub authority: Pubkey,
    pub metadata_uri: String,
    pub records_anchored: u64,
    pub records_revoked: u64,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl ProvenanceAuthority {
    pub const MAX_SIZE: usize = 8
        + 32
        + 4 + crate::constants::MAX_METADATA_URI_LEN
        + 8
        + 8
        + 8
        + 8
        + 1;

    pub fn record_anchor(&mut self, now: i64) -> Result<()> {
        self.records_anchored = self
            .records_anchored
            .checked_add(1)
            .ok_or(crate::errors::ProvenanceError::ArithmeticOverflow)?;
        self.updated_at = now;
        Ok(())
    }

    pub fn record_revocation(&mut self, now: i64) -> Result<()> {
        self.records_revoked = self
            .records_revoked
            .checked_add(1)
            .ok_or(crate::errors::ProvenanceError::ArithmeticOverflow)?;
        self.updated_at = now;
        Ok(())
    }
}