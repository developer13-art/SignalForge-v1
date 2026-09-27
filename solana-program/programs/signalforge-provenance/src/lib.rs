//! SignalForge Provenance Program
//!
//! Anchors the AI processing history of individual signals on Solana.
//! Only hashes and metadata are written on-chain; the raw signal and processing
//! records remain off-chain.

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("SFProvenance11111111111111111111111111111");

#[program]
pub mod signalforge_provenance {
    use super::*;

    /// Initialize the provenance authority. May only be called once.
    pub fn initialize_authority(
        ctx: Context<InitializeAuthority>,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, metadata_uri)
    }

    /// Anchor a new provenance record for a signal.
    pub fn anchor_provenance(
        ctx: Context<AnchorProvenance>,
        signal_reference: String,
        processing_hash: [u8; 32],
        ai_version: String,
        processing_version: String,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::anchor_provenance::handler(
            ctx,
            signal_reference,
            processing_hash,
            ai_version,
            processing_version,
            metadata_uri,
        )
    }

    /// Verify whether a given hash matches the anchored provenance record.
    /// Returns `true` if the hash matches and the record has not been revoked.
    pub fn verify_provenance(
        ctx: Context<VerifyProvenance>,
        expected_hash: [u8; 32],
    ) -> Result<bool> {
        instructions::verify_provenance::handler(ctx, expected_hash)
    }
}