/**
 * Solana Service
 *
 * Top-level orchestration for the Solana layer. Delegates to
 * specialized services for wallets, attestations, provenance,
 * payments, transactions, and verification.
 *
 * @module server/modules/solana/solana.service
 */
const { connectionService } = require('./config/connection.service');
const { networkService } = require('./config/network.service');
const { programConfigService } = require('./config/program-config.service');
const { commitmentService } = require('./config/commitment.service');
const { walletService } = require('./wallets/wallet.service');
const { walletConnectService } = require('./wallets/wallet-connect.service');
const { siwsService } = require('./wallets/siws.service');
const { signatureVerificationService } = require('./wallets/signature-verification.service');
const { walletNonceService } = require('./wallets/wallet-nonce.service');
const { attestationService } = require('./attestations/attestation.service');
const { certificationAttestationService } = require('./attestations/certification-attestation.service');
const { dnaAttestationService } = require('./attestations/dna-attestation.service');
const { reputationAttestationService } = require('./attestations/reputation-attestation.service');
const { provenanceService } = require('./provenance/provenance.service');
const { provenanceAnchorService } = require('./provenance/provenance-anchor.service');
const { solanaPaymentService } = require('./payments/solana-payment.service');
const { paymentVerificationService } = require('./payments/payment-verification.service');
const { transactionService } = require('./transactions/transaction.service');
const { verificationService } = require('./verification/verification.service');
const { publicVerificationService } = require('./verification/public-verification.service');
async function getSolanaOverview() {
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
const solanaService = {
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
module.exports.solanaService = solanaService;

module.exports.getSolanaOverview = getSolanaOverview;
