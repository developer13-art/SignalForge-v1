//! SignalForge Attestation Program
//!
//! Anchors provider certification, DNA confidence, and reputation records on Solana.
//! Sensitive data is never stored on-chain. Only hashes, public identifiers, and
//! public reputation data are written.

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("SFAttest1111111111111111111111111111111111");

#[program]
pub mod signalforge_attestation {
    use super::*;

    /// Initialize the global attestation authority.
    ///
    /// May only be called once. The caller becomes the initial authority.
    pub fn initialize_authority(
        ctx: Context<InitializeAuthority>,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, metadata_uri)
    }

    /// Create a new attestation.
    ///
    /// Only the authority may call this. Each attestation is keyed by
    /// `(subject, kind, nonce)` and stores a hash of the off-chain payload.
    pub fn create_attestation(
        ctx: Context<CreateAttestation>,
        kind: state::AttestationKind,
        payload_hash: [u8; 32],
        subject_reference: String,
        version: u16,
        metadata_uri: String,
        expires_at: i64,
    ) -> Result<()> {
        instructions::create_attestation::handler(
            ctx,
            kind,
            payload_hash,
            subject_reference,
            version,
            metadata_uri,
            expires_at,
        )
    }

    /// Update the payload hash and metadata URI of an existing attestation.
    ///
    /// Only the authority may call this. The version is incremented.
    pub fn update_attestation(
        ctx: Context<UpdateAttestation>,
        payload_hash: [u8; 32],
        version: u16,
        metadata_uri: String,
        expires_at: i64,
    ) -> Result<()> {
        instructions::update_attestation::handler(ctx, payload_hash, version, metadata_uri, expires_at)
    }

    /// Revoke an attestation. Only the authority may call this.
    pub fn revoke_attestation(
        ctx: Context<RevokeAttestation>,
        reason: String,
    ) -> Result<()> {
        instructions::revoke_attestation::handler(ctx, reason)
    }
}