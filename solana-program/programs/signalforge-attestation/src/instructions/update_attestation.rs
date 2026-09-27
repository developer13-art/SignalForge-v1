//! Updates an existing attestation.

use anchor_lang::prelude::*;

use crate::constants::{ATTESTATION_SEED, AUTHORITY_SEED, MAX_METADATA_URI_LEN};
use crate::errors::AttestationError;
use crate::events::AttestationUpdated;
use crate::state::{Attestation, AttestationAuthority, AttestationKind};

#[derive(Accounts)]
pub struct UpdateAttestation<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
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

pub fn handler(
    ctx: Context<UpdateAttestation>,
    payload_hash: [u8; 32],
    version: u16,
    metadata_uri: String,
    expires_at: i64,
) -> Result<()> {
    require!(
        metadata_uri.len() <= MAX_METADATA_URI_LEN,
        AttestationError::MetadataUriTooLong
    );
    require!(payload_hash != [0u8; 32], AttestationError::InvalidPayloadHash);

    let attestation = &mut ctx.accounts.attestation;

    require!(!attestation.revoked, AttestationError::AttestationAlreadyRevoked);
    require!(version >= attestation.version, AttestationError::InvalidVersion);

    if expires_at > 0 {
        require!(
            expires_at >= crate::constants::MIN_EXPIRES_AT
                && expires_at <= crate::constants::MAX_EXPIRES_AT,
            AttestationError::InvalidExpiration
        );
    }

    let previous_hash = attestation.payload_hash;
    let previous_version = attestation.version;
    let now = Clock::get()?.unix_timestamp;

    attestation.payload_hash = payload_hash;
    attestation.version = version;
    attestation.metadata_uri = metadata_uri;
    attestation.updated_at = now;
    attestation.expires_at = expires_at;

    emit!(AttestationUpdated {
        attestation: attestation.key(),
        authority: ctx.accounts.authority.key(),
        previous_payload_hash: previous_hash,
        new_payload_hash: payload_hash,
        previous_version,
        new_version: version,
        expires_at,
        timestamp: now,
    });

    Ok(())
}