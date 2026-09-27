//! Program error codes.

use anchor_lang::prelude::*;

#[error_code]
pub enum ProvenanceError {
    #[msg("The provided signal reference is empty.")]
    SignalReferenceEmpty,

    #[msg("The provided signal reference is too long.")]
    SignalReferenceTooLong,

    #[msg("The provided AI version string is too long.")]
    AiVersionTooLong,

    #[msg("The provided processing version string is too long.")]
    ProcessingVersionTooLong,

    #[msg("The provided metadata URI is too long.")]
    MetadataUriTooLong,

    #[msg("The provided processing hash is all zeros.")]
    InvalidProcessingHash,

    #[msg("The provenance record has been revoked.")]
    ProvenanceRevoked,

    #[msg("The provided authority does not match the program authority.")]
    InvalidAuthority,

    #[msg("Arithmetic overflow while processing provenance.")]
    ArithmeticOverflow,
}