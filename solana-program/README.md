# SignalForge Solana Programs

Anchor programs that power SignalForge's on-chain trust layer: provider attestations, AI signal provenance, and subscription payments.

## Overview

SignalForge uses Solana for verifiable trust. Off-chain AI runs as usual in the main application — the Solana layer exists to make specific claims independently verifiable on-chain:

- **Attestation Program** — Anchors provider certifications, DNA confidence scores, and reputation records.
- **Provenance Program** — Anchors cryptographic hashes proving when and how a signal was processed by the AI pipeline.
- **Payment Program** — Enables subscription payments in SOL and SPL tokens, with on-chain receipt records.

Sensitive data — raw messages, user PII, trade positions — is never written on-chain. Only hashes, public identifiers, and public reputation records are stored.

## Programs

### `signalforge-attestation`

Stores signed attestations about providers.

State:
- `Attestation` — A single attestation record with subject, kind, payload hash, and version.
- `AttestationAuthority` — Global program configuration and authorized writers.

Instructions:
- `initialize_authority` — One-time setup of the program authority.
- `create_attestation` — Create a new attestation for a subject.
- `update_attestation` — Amend the payload hash of an existing attestation.
- `revoke_attestation` — Mark an attestation as revoked.

### `signalforge-provenance`

Stores AI processing provenance records for individual signals.

State:
- `ProvenanceRecord` — Signal identifier, AI processing hash, model version, and anchor timestamp.

Instructions:
- `initialize_provenance` — One-time setup of the program authority.
- `anchor_provenance` — Anchor a new provenance record for a signal.
- `verify_provenance` — Public verification that returns whether a hash matches a record.

### `signalforge-payment`

Receives subscription payments in SOL or SPL tokens.

State:
- `Payment` — A single payment intent with payer, amount, token mint, and confirmation status.
- `Treasury` — Treasury configuration with authority and accepted token mints.

Instructions:
- `initialize_treasury` — One-time setup of the treasury.
- `create_payment` — Create a payment intent for a subscription.
- `confirm_payment` — Mark a payment as confirmed on-chain.
- `refund_payment` — Refund an unconfirmed payment.

## Prerequisites

- Rust 1.75+
- Solana CLI 1.18.26
- Anchor 0.30.1
- Node.js 20.11.1+
- pnpm (or yarn/npm)

## Build


Produces `.so` files under `target/deploy/` and TypeScript IDL files under `target/types/`.

## Test


Runs the full test suite against a local validator.

## Deploy

Devnet:


Mainnet:


After deploy, update `Anchor.toml` with the resulting program IDs, and copy them into the server's `SOLANA_ATTESTATION_PROGRAM_ID`, `SOLANA_PROVENANCE_PROGRAM_ID`, and `SOLANA_PAYMENT_PROGRAM_ID` environment variables.

## Client SDK

Type-safe clients live in `app/`:

- `attestation-client.ts`
- `provenance-client.ts`
- `payment-client.ts`

These are used by the SignalForge backend `server/src/modules/solana/` modules.

## Directory Structure

solana-program/
├── programs/ Anchor programs (Rust)
├── tests/ TypeScript integration tests
├── migrations/ Deployment scripts
├── scripts/ Helper shell scripts
├── app/ TypeScript client SDK
├── Anchor.toml
├── Cargo.toml
├── package.json
└── tsconfig.json

## Security

- All programs are upgradeable by a single authority.
- Program authority should be a multisig on mainnet.
- Every state account is validated by PDA derivation.
- Only authorized writers may create attestations.
- Payments are idempotent by design using the payment PDA as the key.

## License

Proprietary. Copyright (c) SignalForge. All rights reserved.