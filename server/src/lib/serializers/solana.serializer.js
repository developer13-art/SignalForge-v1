/**
 * Solana Serializer
 *
 * @module server/lib/serializers/solana.serializer
 */

export function serializeSolanaWallet(wallet) {
  if (!wallet) {
    return null;
  }

  return {
    walletId: wallet.id,
    userId: wallet.user_id,
    walletAddress: wallet.wallet_address,
    isPrimary: wallet.is_primary,
    label: wallet.label,
    verifiedAt: wallet.verified_at,
    createdAt: wallet.created_at,
  };
}

export function serializeSolanaAttestation(attestation) {
  if (!attestation) {
    return null;
  }

  return {
    attestationId: attestation.id,
    subjectType: attestation.subject_type,
    subjectId: attestation.subject_id,
    attestationType: attestation.attestation_type,
    attestationHash: attestation.attestation_hash,
    status: attestation.status,
    txSignature: attestation.tx_signature,
    slot: attestation.slot,
    createdAt: attestation.created_at,
    confirmedAt: attestation.confirmed_at,
  };
}

export function serializeSolanaPayment(payment) {
  if (!payment) {
    return null;
  }

  return {
    paymentId: payment.id,
    userId: payment.user_id,
    subscriptionId: payment.subscription_id,
    purpose: payment.purpose,
    amount: payment.amount,
    token: payment.token,
    status: payment.status,
    txSignature: payment.tx_signature,
    createdAt: payment.created_at,
    confirmedAt: payment.confirmed_at,
  };
}

export default serializeSolanaWallet;