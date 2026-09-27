//! Program events.

use anchor_lang::prelude::*;

use crate::state::{Attestation, AttestationKind};

/// Emitted when the program authority is initialized.
#[event]
pub struct AuthorityInitialized {
    pub authority: Pubkey,
    pub metadata_uri: String,
    pub timestamp: i64,
}

/// Emitted when a new attestation is created.
#[event]
pub struct AttestationCreated {
    pub attestation: Pubkey,
    pub authority: Pubkey,
    pub subject: Pubkey,
    pub kind: AttestationKind,
    pub payload_hash: [u8; 32],
    pub version: u16,
    pub expires_at: i64,
    pub timestamp: i64,
}

/// Emitted when an attestation is updated.
#[event]
pub struct AttestationUpdated {
    pub attestation: Pubkey,
    pub authority: Pubkey,
    pub previous_payload_hash: [u8; 32],
    pub new_payload_hash: [u8; 32],
    pub previous_version: u16,
    pub new_version: u16,
    pub expires_at: i64,
    pub timestamp: i64,
}

/// Emitted when an attestation is revoked.
#[event]
pub struct AttestationRevoked {
    pub attestation: Pubkey,
    pub authority: Pubkey,
    pub reason: String,
    pub timestamp: i64,
}

/// Convenience log helper used by all events.
pub fn log_attestation(event: &Attestation) {
    msg!(
        "Attestation: subject={} kind={:?} version={} revoked={}",
        event.subject_reference,
        event.kind,
        event.version,
        event.revoked
    );
}