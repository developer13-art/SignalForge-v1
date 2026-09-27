//! Payment state.

use anchor_lang::prelude::*;

/// Status of a payment intent.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum PaymentStatus {
    Pending,
    Confirmed,
    Refunded,
}

/// A single payment intent.
#[account]
#[derive(Debug)]
pub struct Payment {
    /// Public, human-readable payment reference.
    pub payment_reference: String,

    /// Off-chain subscription reference this payment funds.
    pub subscription_reference: String,

    /// The payer.
    pub payer: Pubkey,

    /// Amount in native token units.
    pub amount: u64,

    /// The SPL token mint (Pubkey::default() for native SOL).
    pub token_mint: Pubkey,

    /// Current status.
    pub status: PaymentStatus,

    /// Transaction signature of the funding transfer (populated on confirm).
    pub tx_signature: String,

    /// The authority that confirmed or refunded the payment.
    pub authority: Pubkey,

    /// Unix timestamp of creation.
    pub created_at: i64,

    /// Unix timestamp of confirmation (0 if not confirmed).
    pub confirmed_at: i64,

    /// Unix timestamp of refund (0 if not refunded).
    pub refunded_at: i64,

    /// Reason for refund (empty if not refunded).
    pub refund_reason: String,

    /// Bump seed for the payment PDA.
    pub bump: u8,
}

impl Payment {
    pub const MAX_SIZE: usize = 8
        + 4 + crate::constants::MAX_PAYMENT_REFERENCE_LEN
        + 4 + crate::constants::MAX_SUBSCRIPTION_REFERENCE_LEN
        + 32
        + 8
        + 32
        + 1
        + 4 + crate::constants::MAX_TX_SIGNATURE_LEN
        + 32
        + 8
        + 8
        + 8
        + 4 + crate::constants::MAX_REFUND_REASON_LEN
        + 1;

    pub fn is_pending(&self) -> bool {
        self.status == PaymentStatus::Pending
    }

    pub fn is_confirmed(&self) -> bool {
        self.status == PaymentStatus::Confirmed
    }

    pub fn is_refunded(&self) -> bool {
        self.status == PaymentStatus::Refunded
    }
}