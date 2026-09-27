//! Attestation authority state.

use anchor_lang::prelude::*;

/// Global program authority. One per program deployment.
#[account]
#[derive(Debug)]
pub struct AttestationAuthority {
    /// Current program authority (single signer authorized to write attestations).
    pub authority: Pubkey,

    /// Optional public metadata URI (e.g. documentation, deployment info).
    pub metadata_uri: String,

    /// Counter of attestations created by this program.
    pub attestations_created: u64,

    /// Counter of attestations revoked by this program.
    pub attestations_revoked: u64,

    /// Unix timestamp of authority initialization.
    pub created_at: i64,

    /// Unix timestamp of the last update to the authority.
    pub updated_at: i64,

    /// Bump seed for the authority PDA.
    pub bump: u8,
}

impl AttestationAuthority {
    pub const MAX_SIZE: usize = 8  // discriminator
        + 32                       // authority
        + 4 + 256                  // metadata_uri
        + 8                        // attestations_created
        + 8                        // attestations_revoked
        + 8                        // created_at
        + 8                        // updated_at
        + 1;                       // bump

    /// Increment the attestation counter safely.
    pub fn record_attestation(&mut self, now: i64) -> Result<()> {
        self.attestations_created = self
            .attestations_created
            .checked_add(1)
            .ok_or(crate::errors::AttestationError::ArithmeticOverflow)?;
        self.updated_at = now;
        Ok(())
    }

    /// Increment the revocation counter safely.
    pub fn record_revocation(&mut self, now: i64) -> Result<()> {
        self.attestations_revoked = self
            .attestations_revoked
            .checked_add(1)
            .ok_or(crate::errors::AttestationError::ArithmeticOverflow)?;
        self.updated_at = now;
        Ok(())
    }
}