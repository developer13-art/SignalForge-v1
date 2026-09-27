//! Program constants.

/// Seed used to derive the attestation authority PDA.
pub const AUTHORITY_SEED: &[u8] = b"attestation_authority";

/// Seed used to derive individual attestation PDAs.
pub const ATTESTATION_SEED: &[u8] = b"attestation";

/// Maximum length of the metadata URI.
pub const MAX_METADATA_URI_LEN: usize = 256;

/// Maximum length of the subject reference string (public identifier).
pub const MAX_SUBJECT_REFERENCE_LEN: usize = 64;

/// Maximum length of the revocation reason string.
pub const MAX_REVOCATION_REASON_LEN: usize = 200;

/// Minimum valid expiration timestamp (2025-01-01 00:00:00 UTC).
pub const MIN_EXPIRES_AT: i64 = 1_735_689_600;

/// Maximum valid expiration timestamp (2045-01-01 00:00:00 UTC).
pub const MAX_EXPIRES_AT: i64 = 2_366_841_600;