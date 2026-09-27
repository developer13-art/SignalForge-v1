//! Verifies a provenance record.

use anchor_lang::prelude::*;

use crate::constants::PROVENANCE_SEED;
use crate::events::ProvenanceVerified;
use crate::state::ProvenanceRecord;

#[derive(Accounts)]
#[instruction(expected_hash: [u8; 32])]
pub struct VerifyProvenance<'info> {
    /// CHECK: Any caller may verify. Verification is public and read-only.
    pub verifier: UncheckedAccount<'info>,

    #[account(
        seeds = [PROVENANCE_SEED, provenance.signal_reference.as_bytes()],
        bump = provenance.bump,
    )]
    pub provenance: Account<'info, ProvenanceRecord>,
}

pub fn handler(ctx: Context<VerifyProvenance>, expected_hash: [u8; 32]) -> Result<bool> {
    let provenance = &ctx.accounts.provenance;
    let matched = provenance.verify(&expected_hash);
    let now = Clock::get()?.unix_timestamp;

    emit!(ProvenanceVerified {
        provenance: provenance.key(),
        expected_hash,
        matched,
        timestamp: now,
    });

    Ok(matched)
}