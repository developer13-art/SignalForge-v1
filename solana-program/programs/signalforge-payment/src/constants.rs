//! Program constants.

/// Seed for the treasury PDA.
pub const TREASURY_SEED: &[u8] = b"payment_treasury";

/// Seed for individual payment PDAs.
pub const PAYMENT_SEED: &[u8] = b"payment";

/// Maximum length of the payment reference string.
pub const MAX_PAYMENT_REFERENCE_LEN: usize = 80;

/// Maximum length of the subscription reference string.
pub const MAX_SUBSCRIPTION_REFERENCE_LEN: usize = 80;

/// Maximum length of the metadata URI.
pub const MAX_METADATA_URI_LEN: usize = 256;

/// Maximum length of the transaction signature string (base58 encoded).
pub const MAX_TX_SIGNATURE_LEN: usize = 100;

/// Maximum length of the refund reason.
pub const MAX_REFUND_REASON_LEN: usize = 200;

/// Minimum payment amount (0.0001 USDC equivalent, but in native units).
pub const MIN_PAYMENT_AMOUNT: u64 = 1;

/// Maximum payment amount (1 billion tokens in native units).
pub const MAX_PAYMENT_AMOUNT: u64 = 1_000_000_000_000_000;