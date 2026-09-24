/**
 * Solana API
 *
 * @module client/src/api/solana.api
 */

import { get, post, patch, del } from './client.js';
import { endpoints } from './endpoints.js';

export const solanaApi = {
  getOverview: () => get(endpoints.solana.overview),

  getNetworkInfo: () => get(endpoints.solana.network),

  getProgramsInfo: () => get(endpoints.solana.programs),

  getHealth: () => get(endpoints.solana.health),

  listWallets: () => get(endpoints.solana.wallets),

  getWallet: (walletId) => get(endpoints.solana.wallet(walletId)),

  getPrimaryWallet: () => get(endpoints.solana.primaryWallet),

  getWalletCount: () => get(endpoints.solana.walletCount),

  beginWalletConnect: (payload) => post(endpoints.solana.beginConnect, payload),

  completeWalletConnect: (payload) => post(endpoints.solana.completeConnect, payload),

  setPrimaryWallet: (walletId) => post(endpoints.solana.setPrimary(walletId)),

  updateWalletLabel: (walletId, payload) =>
    patch(endpoints.solana.updateWalletLabel(walletId), payload),

  disconnectWallet: (walletId, payload) =>
    del(endpoints.solana.disconnectWallet(walletId), { data: payload }),

  listAttestations: (params) => get(endpoints.solana.attestations, { params }),

  getAttestation: (attestationId) => get(endpoints.solana.attestation(attestationId)),

  listAttestationsBySubject: (subjectType, subjectId, params) =>
    get(endpoints.solana.attestationBySubject(subjectType, subjectId), { params }),

  revokeAttestation: (attestationId, payload) =>
    post(endpoints.solana.revokeAttestation(attestationId), payload),

  listPendingAttestations: (params) =>
    get(endpoints.solana.pendingAttestations, { params }),

  getAttestationStatusBreakdown: () =>
    get(endpoints.solana.attestationStatusBreakdown),

  getProvenanceBySignal: (signalId) => get(endpoints.solana.provenanceBySignal(signalId)),

  getProvenance: (provenanceId) => get(endpoints.solana.provenance(provenanceId)),

  listProvenanceByProvider: (providerId, params) =>
    get(endpoints.solana.provenanceByProvider(providerId), { params }),

  verifyProcessingHash: (payload) => post(endpoints.solana.verifyProcessingHash, payload),

  confirmProvenanceAnchor: (provenanceId, payload) =>
    post(endpoints.solana.confirmProvenanceAnchor(provenanceId), payload),

  failProvenanceAnchor: (provenanceId, payload) =>
    post(endpoints.solana.failProvenanceAnchor(provenanceId), payload),

  listPendingProvenance: (params) => get(endpoints.solana.pendingProvenance, { params }),

  getProvenanceStatusBreakdown: () =>
    get(endpoints.solana.provenanceStatusBreakdown),

  listPayments: (params) => get(endpoints.solana.payments, { params }),

  createPayment: (payload) => post(endpoints.solana.createPayment, payload),

  getPayment: (paymentId) => get(endpoints.solana.payment(paymentId)),

  attachSignature: (paymentId, payload) =>
    post(endpoints.solana.attachSignature(paymentId), payload),

  verifyPayment: (paymentId) => post(endpoints.solana.verifyPayment(paymentId)),

  confirmPayment: (paymentId) => post(endpoints.solana.confirmPayment(paymentId)),

  markPaymentConfirmed: (paymentId, payload) =>
    post(endpoints.solana.markPaymentConfirmed(paymentId), payload),

  markPaymentFailed: (paymentId, payload) =>
    post(endpoints.solana.markPaymentFailed(paymentId), payload),

  refundPayment: (paymentId, payload) =>
    post(endpoints.solana.refundPayment(paymentId), payload),

  sweepPendingPayments: () => post(endpoints.solana.sweepPendingPayments),

  sweepExpiredPayments: () => post(endpoints.solana.sweepExpiredPayments),

  getPaymentStatusBreakdown: () => get(endpoints.solana.paymentStatusBreakdown),
};

export default solanaApi;