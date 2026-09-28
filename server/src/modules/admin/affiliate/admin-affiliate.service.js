/**
 * Admin Affiliate Service
 *
 * @module server/modules/admin/affiliate/admin-affiliate.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { normalizePagination, buildPaginationMeta } = require('@signalforge/shared/utils/pagination.util');
const repository = require('./admin-affiliate.repository');
const { adminService } = require('../admin.service');
async function listPartners({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listPartners({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      partnerId: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      status: row.status,
      tier: row.tier,
      referralCount: row.referral_count,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}
async function getPartnerDetails({ partnerId }) {
  if (!partnerId) {
    throw new AppError('partnerId is required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const partner = await repository.findPartnerById({ partnerId });

  if (!partner) {
    throw new AppError('Affiliate partner not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return partner;
}
async function suspendPartner({ partnerId, adminId, reason }) {
  if (!partnerId || !adminId) {
    throw new AppError('partnerId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updatePartnerStatus({ partnerId, status: 'SUSPENDED' });

  if (!updated) {
    throw new AppError('Affiliate partner not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SYSTEM_SETTING_UPDATE',
    targetType: 'AFFILIATE_PARTNER',
    targetId: partnerId,
    details: { action: 'SUSPEND_PARTNER', reason },
  });

  logger.info({ partnerId, adminId, reason }, 'Affiliate partner suspended');

  return { suspended: true };
}
async function activatePartner({ partnerId, adminId }) {
  if (!partnerId || !adminId) {
    throw new AppError('partnerId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updatePartnerStatus({ partnerId, status: 'ACTIVE' });

  if (!updated) {
    throw new AppError('Affiliate partner not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return { activated: true };
}
async function updatePartnerTier({ partnerId, adminId, tier }) {
  if (!partnerId || !adminId || !tier) {
    throw new AppError('partnerId, adminId, and tier are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const validTiers = ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM', 'ENTERPRISE'];

  if (!validTiers.includes(tier)) {
    throw new AppError(`Invalid tier: ${tier}`, ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updatePartnerTier({ partnerId, tier });

  if (!updated) {
    throw new AppError('Affiliate partner not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SYSTEM_SETTING_UPDATE',
    targetType: 'AFFILIATE_PARTNER',
    targetId: partnerId,
    details: { action: 'UPDATE_TIER', tier },
  });

  return { updated: true, tier };
}
async function listCommissions({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listCommissions({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      commissionId: row.id,
      partnerUserId: row.partner_user_id,
      partnerEmail: row.partner_email,
      referralId: row.referral_id,
      amount: Number(row.amount || 0),
      currency: row.currency,
      status: row.status,
      description: row.description,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}
async function getPartnerStatusBreakdown() {
  const rows = await repository.countPartnersByStatus();

  const breakdown = {};
  for (const row of rows) {
    breakdown[row.status] = row.count;
  }

  return breakdown;
}
const adminAffiliateService = {
  listPartners,
  getPartnerDetails,
  suspendPartner,
  activatePartner,
  updatePartnerTier,
  listCommissions,
  getPartnerStatusBreakdown,
};
module.exports.adminAffiliateService = adminAffiliateService;

module.exports.listPartners = listPartners;

module.exports.getPartnerDetails = getPartnerDetails;

module.exports.suspendPartner = suspendPartner;

module.exports.activatePartner = activatePartner;

module.exports.updatePartnerTier = updatePartnerTier;

module.exports.listCommissions = listCommissions;

module.exports.getPartnerStatusBreakdown = getPartnerStatusBreakdown;
