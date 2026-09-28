/**
 * Solana Service
 *
 * Top-level orchestration for the Solana layer. Delegates to
 * specialized services for wallets, attestations, provenance,
 * payments, transactions, and verification.
 *
 * @module server/modules/solana/solana.service
 */

import { connectionService } from './config/connection.service';
import { networkService } from './config/network.service';
import { programConfigService } from './config/program-config.service';
import { commitmentService } from './config/commitment.service';
import { walletService } from './wallets/wallet.service';
import { walletConnectService } from './wallets/wallet-connect.service';
import { siwsService } from './wallets/siws.service';
import { signatureVerificationService } from './wallets/signature-verification.service';
import { walletNonceService } from './wallets/wallet-nonce.service';
import { attestationService } from './attestations/attestation.service';
import { certificationAttestationService } from './attestations/certification-attestation.service';
import { dnaAttestationService } from './attestations/dna-attestation.service';
import { reputationAttestationService } from './attestations/reputation-attestation.service';
import { provenanceService } from './provenance/provenance.service';
import { provenanceAnchorService } from './provenance/provenance-anchor.service';
import { solanaPaymentService } from './payments/solana-payment.service';
import { paymentVerificationService } from './payments/payment-verification.service';
import { transactionService } from './transactions/transaction.service';
import { verificationService } from './verification/verification.service';
import { publicVerificationService } from './verification/public-verification.service';

export async function getSolanaOverview() {
  const [network, programs, connectionHealth] = await Promise.all([
    Promise.resolve(networkService.getCurrentNetwork()),
    Promise.resolve(programConfigService.getPrograms()),
    connectionService.checkConnectionHealth().catch((err) => ({ healthy: false, error: err.message })),
  ]);

  return {
    network,
    programs,
    connectionHealth,
    checkedAt: new Date().toISOString(),
  };
}

export const solanaService = {
  getSolanaOverview,

  connection: connectionService,
  network: networkService,
  programs: programConfigService,
  commitment: commitmentService,

  wallets: walletService,
  walletConnect: walletConnectService,
  siws: siwsService,
  signatureVerification: signatureVerificationService,
  walletNonce: walletNonceService,

  attestations: attestationService,
  certificationAttestations: certificationAttestationService,
  dnaAttestations: dnaAttestationService,
  reputationAttestations: reputationAttestationService,

  provenance: provenanceService,
  provenanceAnchor: provenanceAnchorService,

  payments: solanaPaymentService,
  paymentVerification: paymentVerificationService,

  transactions: transactionService,

  verification: verificationService,
  publicVerification: publicVerificationService,
};