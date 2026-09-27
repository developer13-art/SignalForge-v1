//! Initializes the treasury.

use anchor_lang::prelude::*;

use crate::constants::{MAX_METADATA_URI_LEN, TREASURY_SEED};
use crate::errors::PaymentError;
use crate::events::TreasuryInitialized;
use crate::state::Treasury;

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Treasury::MAX_SIZE,
        seeds = [TREASURY_SEED],
        bump,
    )]
    pub treasury: Account<'info, Treasury>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeTreasury>, metadata_uri: String) -> Result<()> {
    require!(
        metadata_uri.len() <= MAX_METADATA_URI_LEN,
        PaymentError::MetadataUriTooLong
    );

    let now = Clock::get()?.unix_timestamp;
    let treasury = &mut ctx.accounts.treasury;

    treasury.authority = ctx.accounts.authority.key();
    treasury.sol_vault = treasury.key();
    treasury.metadata_uri = metadata_uri.clone();
    treasury.payments_created = 0;
    treasury.payments_confirmed = 0;
    treasury.payments_refunded = 0;
    treasury.created_at = now;
    treasury.updated_at = now;
    treasury.bump = ctx.bumps.treasury;

    emit!(TreasuryInitialized {
        treasury: treasury.key(),
        authority: ctx.accounts.authority.key(),
        metadata_uri,
        timestamp: now,
    });

    Ok(())
}