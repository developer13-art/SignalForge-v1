//! Revokes an existing attestation.

use anchor_lang::prelude::*;

use crate::constants::{ATTESTATION_SEED, AUTHORITY_SEED, MAX_REVOCATION_REASON_LEN};
use crate::errors::AttestationError;
use crate::events::AttestationRevoked;
use crate::state::{Attestation, AttestationAuthority, AttestationKind};

#[derive(Accounts)]
pub struct RevokeAttestation<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [AUTHORITY_SEED],
        bump = authority_state.bump,
        has_one = authority @ AttestationError::InvalidAuthority,
    )]
    pub authority_state: Account<'info, AttestationAuthority>,

    /// CHECK: Validated via the attestation account below.
    pub subject: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            ATTESTATION_SEED,
            subject.key().as_ref(),
            &kind_seed(&attestation.kind),
        ],
        bump = attestation.bump,
        has_one = authority @ AttestationError::InvalidAuthority,
        constraint = attestation.subject == subject.key() @ AttestationError::SubjectMismatch,
    )]
    pub attestation: Account<'info, Attestation>,

    pub system_program: Program<'info, System>,
}

fn kind_seed(kind: &AttestationKind) -> [u8; 1] {
    match kind {
        AttestationKind::Certification => [0u8],
        AttestationKind::Dna => [1u8],
        AttestationKind::Reputation => [2u8],
        AttestationKind::Other => [3u8],
    }
}

pub fn handler(ctx: Context<RevokeAttestation>, reason: String) -> Result<()> {
    require!(
        reason.len() <= MAX_REVOCATION_REASON_LEN,
        AttestationError::RevocationReasonTooLong
    );

    let now = Clock::get()?.unix_timestamp;

    let attestation = &mut ctx.accounts.attestation;
    require!(!attestation.revoked, AttestationError::AttestationAlreadyRevoked);

    attestation.revoked = true;
    attestation.revocation_reason = reason.clone();
    attestation.revoked_at = now;
    attestation.updated_at = now;

    let authority_state = &mut ctx.accounts.authority_state;
    authority_state.record_revocation(now)?;

    emit!(AttestationRevoked {
        attestation: attestation.key(),
        authority: ctx.accounts.authority.key(),
        reason,
        timestamp: now,
    });

    Ok(())
}