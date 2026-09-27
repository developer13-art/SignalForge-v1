//! Program error codes.

use anchor_lang::prelude::*;

#[error_code]
pub enum PaymentError {
    #[msg("The provided payment reference is empty.")]
    PaymentReferenceEmpty,

    #[msg("The provided payment reference is too long.")]
    PaymentReferenceTooLong,

    #[msg("The provided subscription reference is empty.")]
    SubscriptionReferenceEmpty,

    #[msg("The provided subscription reference is too long.")]
    SubscriptionReferenceTooLong,

    #[msg("The provided metadata URI is too long.")]
    MetadataUriTooLong,

    #[msg("The provided transaction signature is too long.")]
    TxSignatureTooLong,

    #[msg("The provided refund reason is too long.")]
    RefundReasonTooLong,

    #[msg("The payment amount is outside the allowed range.")]
    InvalidAmount,

    #[msg("The payment has already been confirmed.")]
    PaymentAlreadyConfirmed,

    #[msg("The payment has already been refunded.")]
    PaymentAlreadyRefunded,

    #[msg("The payment has not been confirmed yet.")]
    PaymentNotConfirmed,

    #[msg("The provided authority does not match the treasury authority.")]
    InvalidAuthority,

    #[msg("The provided token mint is not accepted by the treasury.")]
    UnsupportedTokenMint,

    #[msg("Arithmetic overflow while processing the payment.")]
    ArithmeticOverflow,
}