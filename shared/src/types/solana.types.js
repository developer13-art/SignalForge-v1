/**
 * Solana Type Definitions
 *
 * Provides JSDoc typedefs for Solana-related objects used by the
 * on-chain integration layer.
 *
 * @module @signalforge/shared/types/solana
 */

/**
 * @typedef {Object} SolanaWallet
 * @property {string} walletId
 * @property {string} userId
 * @property {string} walletAddress
 * @property {boolean} isPrimary
 * @property {string|null} label
 * @property {string|null} verifiedAt
 * @property {string|null} signatureProof
 * @property {string|null} lastUsedAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} SolanaAttestation
 * @property {string} attestationId
 * @property {string} attestationType
 * @property {string} subjectId
 * @property {string} subjectType
 * @property {string} attestationHash
 * @property {Object|null} publicData
 * @property {Object|null} onChainData
 * @property {string|null} programId
 * @property {string|null} pda
 * @property {string|null} txSignature
 * @property {number|null} slot
 * @property {number|null} blockTime
 * @property {string|null} network
 * @property {string} status
 * @property {string|null} submittedAt
 * @property {string|null} confirmedAt
 * @property {string|null} failureReason
 * @property {string|null} revokedAt
 * @property {string|null} revocationReason
 * @property {string} createdAt
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} SolanaProvenance
 * @property {string} provenanceId
 * @property {string} signalId
 * @property {string|null} providerId
 * @property {string|null} tradeId
 * @property {string} processingHash
 * @property {string|null} signalHash
 * @property {string} aiVersion
 * @property {string|null} modelId
 * @property {string|null} parserType
 * @property {Array<string>} processingSteps
 * @property {Object|null} publicData
 * @property {string|null} programId
 * @property {string|null} pda
 * @property {string|null} txSignature
 * @property {number|null} slot
 * @property {number|null} blockTime
 * @property {string|null} network
 * @property {string} status
 * @property {string|null} failureReason
 * @property {string} anchoredAt
 * @property {string} createdAt
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} SolanaPayment
 * @property {string} paymentId
 * @property {string} userId
 * @property {string|null} subscriptionId
 * @property {string} purpose
 * @property {number} amount
 * @property {string} token
 * @property {number|null} amountUsd
 * @property {number|null} exchangeRate
 * @property {string|null} senderWallet
 * @property {string} recipientWallet
 * @property {string|null} tokenMint
 * @property {string|null} reference
 * @property {string|null} memo
 * @property {string|null} txSignature
 * @property {number|null} slot
 * @property {number|null} blockTime
 * @property {string|null} network
 * @property {number|null} confirmations
 * @property {string} status
 * @property {string|null} expiresAt
 * @property {string|null} submittedAt
 * @property {string|null} confirmedAt
 * @property {string|null} finalizedAt
 * @property {string|null} failureReason
 * @property {string|null} refundedAt
 * @property {string|null} refundTxSignature
 * @property {string} createdAt
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} SolanaTransaction
 * @property {string} transactionId
 * @property {string} userId
 * @property {string} purpose
 * @property {string|null} referenceId
 * @property {string} txSignature
 * @property {string} network
 * @property {string|null} blockhash
 * @property {number|null} slot
 * @property {number|null} blockTime
 * @property {number} fee
 * @property {string} status
 * @property {string|null} failureReason
 * @property {number} attemptCount
 * @property {string} createdAt
 * @property {string|null} confirmedAt
 * @property {string|null} finalizedAt
 */

/**
 * @typedef {Object} SolanaProgramConfig
 * @property {string} configId
 * @property {string} network
 * @property {string} attestationProgramId
 * @property {string} provenanceProgramId
 * @property {string} paymentProgramId
 * @property {string} treasuryWallet
 * @property {string|null} paymentTokenMint
 * @property {boolean} active
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} SolanaIndexerCheckpoint
 * @property {string} checkpointId
 * @property {string} programId
 * @property {string} network
 * @property {string} lastSignature
 * @property {number} lastSlot
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} SolanaVerificationResult
 * @property {string} verificationId
 * @property {string} subjectType
 * @property {string} subjectId
 * @property {boolean} verified
 * @property {string|null} attestationId
 * @property {string|null} txSignature
 * @property {string|null} onChainHash
 * @property {string|null} expectedHash
 * @property {string|null} verifiedAt
 * @property {string|null} failureReason
 */

export const SOLANA_TYPES = Object.freeze({
  SolanaWallet: 'SolanaWallet',
  SolanaAttestation: 'SolanaAttestation',
  SolanaProvenance: 'SolanaProvenance',
  SolanaPayment: 'SolanaPayment',
  SolanaTransaction: 'SolanaTransaction',
  SolanaProgramConfig: 'SolanaProgramConfig',
  SolanaIndexerCheckpoint: 'SolanaIndexerCheckpoint',
  SolanaVerificationResult: 'SolanaVerificationResult',
});