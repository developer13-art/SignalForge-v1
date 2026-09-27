//! Program error codes.

use anchor_lang::prelude::*;

#[error_code]
pub enum AttestationError {
    #[msg("The provided metadata URI is too long.")]
    MetadataUriTooLong,

    #[msg("The provided subject reference is too long.")]
    SubjectReferenceTooLong,

    #[msg("The provided subject reference is empty.")]
    SubjectReferenceEmpty,

    #[msg("The provided revocation reason is too long.")]
    RevocationReasonTooLong,

    #[msg("The provided expiration timestamp is outside the allowed range.")]
    InvalidExpiration,

    #[msg("The attestation has already expired.")]
    AttestationExpired,

    #[msg("The attestation has already been revoked.")]
    AttestationAlreadyRevoked,

    #[msg("The attestation version may not decrease.")]
    InvalidVersion,

    #[msg("The provided payload hash is all zeros.")]
    InvalidPayloadHash,

    #[msg("The provided authority does not match the program authority.")]
    InvalidAuthority,

    #[msg("The attestation subject does not match the expected subject.")]
    SubjectMismatch,

    #[msg("Arithmetic overflow while processing the attestation.")]
    ArithmeticOverflow,
}