//! Program instructions.

pub mod create_attestation;
pub mod initialize;
pub mod revoke_attestation;
pub mod update_attestation;

pub use create_attestation::*;
pub use initialize::*;
pub use revoke_attestation::*;
pub use update_attestation::*;