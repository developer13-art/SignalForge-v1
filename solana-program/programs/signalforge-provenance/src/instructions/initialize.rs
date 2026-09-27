//! Initializes the provenance authority.

use anchor_lang::prelude::*;

use crate::constants::{AUTHORITY_SEED, MAX_METADATA_URI_LEN};
use crate::errors::ProvenanceError;
use crate::events::AuthorityInitialized;
use crate::state::ProvenanceAuthority;

#[derive(Accounts)]
pub struct InitializeAuthority<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = ProvenanceAuthority::MAX_SIZE,
        seeds = [AUTHORITY_SEED],
        bump,
    )]
    pub authority_state: Account<'info, ProvenanceAuthority>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeAuthority>, metadata_uri: String) -> Result<()> {
    require!(
        metadata_uri.len() <= MAX_METADATA_URI_LEN,
        ProvenanceError::MetadataUriTooLong
    );

    let now = Clock::get()?.unix_timestamp;
    let authority_state = &mut ctx.accounts.authority_state;

    authority_state.authority = ctx.accounts.authority.key();
    authority_state.metadata_uri = metadata_uri.clone();
    authority_state.records_anchored = 0;
    authority_state.records_revoked = 0;
    authority_state.created_at = now;
    authority_state.updated_at = now;
    authority_state.bump = ctx.bumps.authority_state;

    emit!(AuthorityInitialized {
        authority: ctx.accounts.authority.key(),
        metadata_uri,
        timestamp: now,
    });

    Ok(())
}