//! Program constants.

/// Seed used to derive the provenance authority PDA.
pub const AUTHORITY_SEED: &[u8] = b"provenance_authority";

/// Seed used to derive individual provenance record PDAs.
pub const PROVENANCE_SEED: &[u8] = b"provenance";

/// Maximum length of the signal reference string.
pub const MAX_SIGNAL_REFERENCE_LEN: usize = 80;

/// Maximum length of the AI version string.
pub const MAX_AI_VERSION_LEN: usize = 32;

/// Maximum length of the processing version string.
pub const MAX_PROCESSING_VERSION_LEN: usize = 32;

/// Maximum length of the metadata URI.
pub const MAX_METADATA_URI_LEN: usize = 256;