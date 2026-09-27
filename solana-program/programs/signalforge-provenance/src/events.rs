//! Program events.

use anchor_lang::prelude::*;

/// Emitted when the provenance authority is initialized.
#[event]
pub struct AuthorityInitialized {
    pub authority: Pubkey,
    pub metadata_uri: String,
    pub timestamp: i64,
}

/// Emitted when a provenance record is anchored.
#[event]
pub struct ProvenanceAnchored {
    pub provenance: Pubkey,
    pub authority: Pubkey,
    pub signal_reference: String,
    pub processing_hash: [u8; 32],
    pub ai_version: String,
    pub processing_version: String,
    pub slot: u64,
    pub timestamp: i64,
}

/// Emitted when a provenance record is revoked.
#[event]
pub struct ProvenanceRevoked {
    pub provenance: Pubkey,
    pub authority: Pubkey,
    pub reason: String,
    pub timestamp: i64,
}

/// Emitted when a provenance verification is performed.
#[event]
pub struct ProvenanceVerified {
    pub provenance: Pubkey,
    pub expected_hash: [u8; 32],
    pub matched: bool,
    pub timestamp: i64,
}