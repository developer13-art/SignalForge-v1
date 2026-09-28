/**
 * Solana Controller
 *
 * HTTP handlers for Solana-level operations.
 *
 * @module server/modules/solana/solana.controller
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const { successResponse } = require('../../lib/response/success.response');
const { solanaService } = require('./solana.service');

export async function getOverview(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    throw new AppError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED, 401);
  }

  const overview = await solanaService.getSolanaOverview();

  return successResponse(res, { overview });
}

export async function getNetworkInfo(req, res) {
  const info = solanaService.network.getNetworkInfo();

  return successResponse(res, { network: info });
}

export async function getProgramsInfo(req, res) {
  const programs = solanaService.programs.getPrograms();

  return successResponse(res, { programs });
}

export async function getConnectionHealth(req, res) {
  const health = await solanaService.connection.checkConnectionHealth();

  return successResponse(res, { health });
}
const solanaController = {
  getOverview,
  getNetworkInfo,
  getProgramsInfo,
  getConnectionHealth,
};
module.exports.solanaController = solanaController;
