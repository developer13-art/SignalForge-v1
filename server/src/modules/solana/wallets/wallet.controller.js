/**
 * Wallet Controller
 *
 * @module server/modules/solana/wallets/wallet.controller
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { successResponse } = require('../../../lib/response/success.response');
const { walletService } = require('./wallet.service');
const { validateBeginConnectPayload, validateCompleteConnectPayload, validateSetPrimaryPayload, validateLabel } = require('./wallet.validator');

function requireUser(req) {
  const userId = req.user && req.user.id;
  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }
  return userId;
}
async function listWallets(req, res) {
  const userId = requireUser(req);

  const wallets = await walletService.listWallets({ userId });

  return successResponse(res, { wallets });
}
async function getWallet(req, res) {
  const userId = requireUser(req);

  const wallet = await walletService.getWallet({ userId, walletId: req.params.walletId });

  return successResponse(res, { wallet });
}
async function getPrimaryWallet(req, res) {
  const userId = requireUser(req);

  const wallet = await walletService.getPrimaryWallet({ userId });

  return successResponse(res, { wallet });
}
async function beginConnect(req, res) {
  const userId = requireUser(req);

  const payload = validateBeginConnectPayload(req.body || {});

  const result = await walletService.beginConnect({ walletAddress: payload.walletAddress });

  return successResponse(res, result);
}
async function completeConnect(req, res) {
  const userId = requireUser(req);

  const payload = validateCompleteConnectPayload(req.body || {});

  const wallet = await walletService.completeConnect({
    userId,
    walletAddress: payload.walletAddress,
    message: payload.message,
    signatureBase58: payload.signatureBase58,
    isPrimary: payload.isPrimary,
    label: payload.label,
  });

  return successResponse(res, { wallet }, 201);
}
async function disconnectWallet(req, res) {
  const userId = requireUser(req);

  const result = await walletService.disconnectWallet({
    userId,
    walletId: req.params.walletId,
    reason: req.body ? req.body.reason : null,
  });

  return successResponse(res, result);
}
async function setPrimary(req, res) {
  const userId = requireUser(req);

  const payload = validateSetPrimaryPayload(req.body || {});

  const result = await walletService.setPrimary({
    userId,
    walletId: payload.walletId,
  });

  return successResponse(res, result);
}
async function updateLabel(req, res) {
  const userId = requireUser(req);

  const label = validateLabel(req.body ? req.body.label : null);

  const wallet = await walletService.updateLabel({
    userId,
    walletId: req.params.walletId,
    label,
  });

  return successResponse(res, { wallet });
}
async function countWallets(req, res) {
  const userId = requireUser(req);

  const count = await walletService.countWallets({ userId });

  return successResponse(res, count);
}
const walletController = {
  listWallets,
  getWallet,
  getPrimaryWallet,
  beginConnect,
  completeConnect,
  disconnectWallet,
  setPrimary,
  updateLabel,
  countWallets,
};
module.exports.walletController = walletController;

module.exports.listWallets = listWallets;

module.exports.getWallet = getWallet;

module.exports.getPrimaryWallet = getPrimaryWallet;

module.exports.beginConnect = beginConnect;

module.exports.completeConnect = completeConnect;

module.exports.disconnectWallet = disconnectWallet;

module.exports.setPrimary = setPrimary;

module.exports.updateLabel = updateLabel;

module.exports.countWallets = countWallets;
