/**
 * SIWS Service
 *
 * Implements Sign-In With Solana: nonce issuance, message
 * construction, signature verification, and wallet link. The message
 * format is deterministic so that the client and server agree on
 * what was signed.
 *
 * @module server/modules/solana/wallets/siws.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { config } = require('../../../config');
const { walletNonceService } = require('./wallet-nonce.service');
const { signatureVerificationService } = require('./signature-verification.service');

function getAppDomain() {
  if (config.app && config.app.url) {
    try {
      return new URL(config.app.url).host;
    } catch (err) {
      return 'signalforge.ai';
    }
  }
  return 'signalforge.ai';
}
function buildSiwsMessage({ walletAddress, nonce, issuedAt }) {
  if (!walletAddress || !nonce) {
    throw new AppError('walletAddress and nonce are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const domain = getAppDomain();
  const network = (config.solana && config.solana.network) || 'devnet';
  const chainId =
    network === 'mainnet-beta' ? 'solana:mainnet' : network === 'localnet' ? 'localnet' : `solana:${network}`;
  const statement = 'Sign in to SignalForge';
  const uri = (config.app && config.app.url) || `https://${domain}`;
  const issuedAtText = issuedAt || new Date().toISOString();

  return [
    `${domain} wants you to sign in with your Solana account:`,
    walletAddress,
    '',
    statement,
    '',
    `URI: ${uri}`,
    `Version: 1`,
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAtText}`,
  ].join('\n');
}
async function createNonceAndMessage({ walletAddress }) {
  const { nonce } = walletNonceService.generateNonce({ walletAddress });

  const issuedAt = new Date().toISOString();

  const message = buildSiwsMessage({ walletAddress, nonce, issuedAt });

  return { walletAddress, nonce, issuedAt, message };
}
async function verifySiwsSignature({ walletAddress, message, signatureBase58 }) {
  if (!walletAddress || !message || !signatureBase58) {
    throw new AppError('walletAddress, message, and signatureBase58 are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const nonceMatch = message.match(/Nonce: ([A-Za-z0-9_-]+)/);

  if (!nonceMatch) {
    return { valid: false, reason: 'NONCE_MISSING_IN_MESSAGE' };
  }

  const nonce = nonceMatch[1];

  const nonceCheck = walletNonceService.consumeNonce({ walletAddress, nonce });

  if (!nonceCheck.valid) {
    return { valid: false, reason: nonceCheck.reason };
  }

  const verification = await signatureVerificationService.verifyWalletOwnership({
    walletAddress,
    message,
    signatureBase58,
  });

  if (!verification.valid) {
    logger.warn({ walletAddress, reason: verification.reason }, 'SIWS verification failed');
    return { valid: false, reason: verification.reason };
  }

  return { valid: true, walletAddress, nonce };
}
const siwsService = {
  buildSiwsMessage,
  createNonceAndMessage,
  verifySiwsSignature,
};
module.exports.siwsService = siwsService;
module.exports.buildSiwsMessage = buildSiwsMessage;

module.exports.createNonceAndMessage = createNonceAndMessage;

module.exports.verifySiwsSignature = verifySiwsSignature;
