//! Creates a new attestation.

use anchor_lang::prelude::*;

use crate::constants::{
    ATTESTATION_SEED, AUTHORITY_SEED, MAX_METADATA_URI_LEN, MAX_SUBJECT_REFERENCE_LEN,
    MAX_EXPIRES_AT, MIN_EXPIRES_AT,
};
use crate::errors::AttestationError;
use crate::events::AttestationCreated;
use crate::state::{Attestation, AttestationAuthority, AttestationKind};

#[derive(Accounts)]
#[instruction(
    kind: AttestationKind,
    payload_hash: [u8; 32],
    subject_reference: String,
    version: u16,
    metadata_uri: String,
    expires_at: i64,
)]
pub struct CreateAttestation<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [AUTHORITY_SEED],
        bump = authority_state.bump,
        has_one = authority @ AttestationError::InvalidAuthority,
    )]
    pub authority_state: Account<'info, AttestationAuthority>,

    /// The subject the attestation is about (usually a provider's wallet).
    /// CHECK: Any public key may be attested. Validated by `subject_reference`.
    pub subject: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        space = Attestation::MAX_SIZE,
        seeds = [
            ATTESTATION_SEED,
            subject.key().as_ref(),
            &kind_seed(&kind),
        ],
        bump,
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
    ctx: Context<CreateAttestation>,
    kind: AttestationKind,
    payload_hash: [u8; 32],
    subject_reference: String,
    version: u16,
    metadata_uri: String,
    expires_at: i64,
) -> Result<()> {
    require!(
        !subject_reference.is_empty(),
        AttestationError::SubjectReferenceEmpty
    );
    require!(
        subject_reference.len() <= MAX_SUBJECT_REFERENCE_LEN,
        AttestationError::SubjectReferenceTooLong
    );
    require!(
        metadata_uri.len() <= MAX_METADATA_URI_LEN,
        AttestationError::MetadataUriTooLong
    );
    require!(payload_hash != [0u8; 32], AttestationError::InvalidPayloadHash);

    if expires_at > 0 {
        require!(
            expires_at >= MIN_EXPIRES_AT && expires_at <= MAX_EXPIRES_AT,
            AttestationError::InvalidExpiration
        );
    }

    let now = Clock::get()?.unix_timestamp;

    let attestation = &mut ctx.accounts.attestation;
    attestation.subject = ctx.accounts.subject.key();
    attestation.subject_reference = subject_reference.clone();
    attestation.kind = kind;
    attestation.payload_hash = payload_hash;
    attestation.version = version;
    attestation.metadata_uri = metadata_uri.clone();
    attestation.created_at = now;
    attestation.updated_at = now;
    attestation.expires_at = expires_at;
    attestation.revoked = false;
    attestation.revocation_reason = String::new();
    attestation.revoked_at = 0;
    attestation.authority = ctx.accounts.authority.key();
    attestation.bump = ctx.bumps.attestation;

    let authority_state = &mut ctx.accounts.authority_state;
    authority_state.record_attestation(now)?;

    emit!(AttestationCreated {
        attestation: attestation.key(),
        authority: ctx.accounts.authority.key(),
        subject: ctx.accounts.subject.key(),
        kind,
        payload_hash,
        version,
        expires_at,
        timestamp: now,
    });

    Ok(())
}