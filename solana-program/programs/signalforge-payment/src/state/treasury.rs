//! Treasury state.

use anchor_lang::prelude::*;

/// Global treasury configuration. One per program deployment.
#[account]
#[derive(Debug)]
pub struct Treasury {
    /// Current treasury authority.
    pub authority: Pubkey,

    /// Pubkey of the treasury's SOL vault (usually the treasury PDA itself).
    pub sol_vault: Pubkey,

    /// Optional metadata URI (e.g. documentation, deployment info).
    pub metadata_uri: String,

    /// Total number of payments created.
    pub payments_created: u64,

    /// Total number of payments confirmed.
    pub payments_confirmed: u64,

    /// Total number of payments refunded.
    pub payments_refunded: u64,

    /// Unix timestamp of treasury initialization.
    pub created_at: i64,

    /// Unix timestamp of the last update.
    pub updated_at: i64,

    /// Bump seed for the treasury PDA.
    pub bump: u8,
}

impl Treasury {
    pub const MAX_SIZE: usize = 8
        + 32
        + 32
        + 4 + crate::constants::MAX_METADATA_URI_LEN
        + 8
        + 8
        + 8
        + 8
        + 8
        + 1;

    pub fn record_payment(&mut self, now: i64) -> Result<()> {
        self.payments_created = self
            .payments_created
            .checked_add(1)
            .ok_or(crate::errors::PaymentError::ArithmeticOverflow)?;
        self.updated_at = now;
        Ok(())
    }

    pub fn record_confirmation(&mut self, now: i64) -> Result<()> {
        self.payments_confirmed = self
            .payments_confirmed
            .checked_add(1)
            .ok_or(crate::errors::PaymentError::ArithmeticOverflow)?;
        self.updated_at = now;
        Ok(())
    }

    pub fn record_refund(&mut self, now: i64) -> Result<()> {
        self.payments_refunded = self
            .payments_refunded
            .checked_add(1)
            .ok_or(crate::errors::PaymentError::ArithmeticOverflow)?;
        self.updated_at = now;
        Ok(())
    }
}