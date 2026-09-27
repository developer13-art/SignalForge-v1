//! Anchors a new provenance record.

use anchor_lang::prelude::*;

use crate::constants::{
    AUTHORITY_SEED, MAX_AI_VERSION_LEN, MAX_METADATA_URI_LEN, MAX_PROCESSING_VERSION_LEN,
    MAX_SIGNAL_REFERENCE_LEN, PROVENANCE_SEED,
};
use crate::errors::ProvenanceError;
use crate::events::ProvenanceAnchored;
use crate::state::{ProvenanceAuthority, ProvenanceRecord};

#[derive(Accounts)]
#[instruction(signal_reference: String)]
pub struct AnchorProvenance<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [AUTHORITY_SEED],
        bump = authority_state.bump,
        has_one = authority @ ProvenanceError::InvalidAuthority,
    )]
    pub authority_state: Account<'info, ProvenanceAuthority>,

    #[account(
        init,
        payer = authority,
        space = ProvenanceRecord::MAX_SIZE,
        seeds = [
            PROVENANCE_SEED,
            signal_reference.as_bytes(),
        ],
        bump,
    )]
    pub provenance: Account<'info, ProvenanceRecord>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<AnchorProvenance>,
    signal_reference: String,
    processing_hash: [u8; 32],
    ai_version: String,
    processing_version: String,
    metadata_uri: String,
) -> Result<()> {
    require!(
        !signal_reference.is_empty(),
        ProvenanceError::SignalReferenceEmpty
    );
    require!(
        signal_reference.len() <= MAX_SIGNAL_REFERENCE_LEN,
        ProvenanceError::SignalReferenceTooLong
    );
    require!(
        ai_version.len() <= MAX_AI_VERSION_LEN,
        ProvenanceError::AiVersionTooLong
    );
    require!(
        processing_version.len() <= MAX_PROCESSING_VERSION_LEN,
        ProvenanceError::ProcessingVersionTooLong
    );
    require!(
        metadata_uri.len() <= MAX_METADATA_URI_LEN,
        ProvenanceError::MetadataUriTooLong
    );
    require!(
        processing_hash != [0u8; 32],
        ProvenanceError::InvalidProcessingHash
    );

    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    let provenance = &mut ctx.accounts.provenance;
    provenance.signal_reference = signal_reference.clone();
    provenance.processing_hash = processing_hash;
    provenance.ai_version = ai_version.clone();
    provenance.processing_version = processing_version.clone();
    provenance.metadata_uri = metadata_uri;
    provenance.authority = ctx.accounts.authority.key();
    provenance.anchored_slot = clock.slot;
    provenance.anchored_at = now;
    provenance.revoked = false;
    provenance.revocation_reason = String::new();
    provenance.revoked_at = 0;
    provenance.bump = ctx.bumps.provenance;

    let authority_state = &mut ctx.accounts.authority_state;
    authority_state.record_anchor(now)?;

    emit!(ProvenanceAnchored {
        provenance: provenance.key(),
        authority: ctx.accounts.authority.key(),
        signal_reference,
        processing_hash,
        ai_version,
        processing_version,
        slot: clock.slot,
        timestamp: now,
    });

    Ok(())
}