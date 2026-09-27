//! Program events.

use anchor_lang::prelude::*;

/// Emitted when the treasury is initialized.
#[event]
pub struct TreasuryInitialized {
    pub treasury: Pubkey,
    pub authority: Pubkey,
    pub metadata_uri: String,
    pub timestamp: i64,
}

/// Emitted when a payment is created.
#[event]
pub struct PaymentCreated {
    pub payment: Pubkey,
    pub payer: Pubkey,
    pub payment_reference: String,
    pub subscription_reference: String,
    pub amount: u64,
    pub token_mint: Pubkey,
    pub timestamp: i64,
}

/// Emitted when a payment is confirmed.
#[event]
pub struct PaymentConfirmed {
    pub payment: Pubkey,
    pub authority: Pubkey,
    pub tx_signature: String,
    pub confirmed_at: i64,
}

/// Emitted when a payment is refunded.
#[event]
pub struct PaymentRefunded {
    pub payment: Pubkey,
    pub authority: Pubkey,
    pub reason: String,
    pub refunded_at: i64,
}