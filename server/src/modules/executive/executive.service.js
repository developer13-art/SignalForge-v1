/**
 * Executive Service
 *
 * Top-level orchestration for executive-level analytics. Combines
 * revenue, growth, and retention into a single dashboard view.
 *
 * @module server/modules/executive/executive.service
 */
const { AppError } = require('../../lib/errors/app-error');
const { ERROR_CODES } = require('../../lib/errors/error-codes');
const repository = require('./executive.repository');
const { subscriptionRevenueService } = require('./revenue/subscription-revenue.service');
const { marketplaceRevenueService } = require('./revenue/marketplace-revenue.service');
const { providerRevenueService } = require('./revenue/provider-revenue.service');
const { affiliateRevenueService } = require('./revenue/affiliate-revenue.service');
const { ibRevenueService } = require('./revenue/ib-revenue.service');
const { referralCostService } = require('./revenue/referral-cost.service');
const { paymentFeesService } = require('./revenue/payment-fees.service');
const { netRevenueService } = require('./revenue/net-revenue.service');
const { userGrowthService } = require('./growth/user-growth.service');
const { providerGrowthService } = require('./growth/provider-growth.service');
const { traderGrowthService } = require('./growth/trader-growth.service');
const { volumeGrowthService } = require('./growth/volume-growth.service');
const { retentionService } = require('./analytics/retention.service');
const { conversionService } = require('./analytics/conversion.service');
const { financialReportService } = require('./analytics/financial-report.service');
async function getExecutiveDashboard({ from, to }) {
  const totals = await repository.getPlatformTotals({ from, to });

  const [
    subscriptionRevenue,
    marketplaceRevenue,
    providerRevenue,
    affiliateRevenue,
    ibRevenueAmount,
    referralCost,
    paymentFees,
    netRevenue,
  ] = await Promise.all([
    subscriptionRevenueService.getRevenue({ from, to }),
    marketplaceRevenueService.getRevenue({ from, to }),
    providerRevenueService.getRevenue({ from, to }),
    affiliateRevenueService.getRevenue({ from, to }),
    ibRevenueService.getRevenue({ from, to }),
    referralCostService.getCost({ from, to }),
    paymentFeesService.getFees({ from, to }),
    netRevenueService.getNetRevenue({ from, to }),
  ]);

  return {
    range: totals.range,
    totals,
    revenue: {
      subscription: subscriptionRevenue.total,
      marketplace: marketplaceRevenue.total,
      provider: providerRevenue.total,
      affiliate: affiliateRevenue.total,
      ib: ibRevenueAmount.total,
      referralCost: referralCost.total,
      paymentFees: paymentFees.total,
      net: netRevenue.total,
    },
  };
}
async function getRevenueBreakdown({ from, to }) {
  const [subscriptionRevenue, marketplaceRevenue, providerRevenue, affiliateRevenue, ibRevenueAmount, referralCost, paymentFees, netRevenue] =
    await Promise.all([
      subscriptionRevenueService.getRevenue({ from, to }),
      marketplaceRevenueService.getRevenue({ from, to }),
      providerRevenueService.getRevenue({ from, to }),
      affiliateRevenueService.getRevenue({ from, to }),
      ibRevenueService.getRevenue({ from, to }),
      referralCostService.getCost({ from, to }),
      paymentFeesService.getFees({ from, to }),
      netRevenueService.getNetRevenue({ from, to }),
    ]);

  return {
    subscription: subscriptionRevenue,
    marketplace: marketplaceRevenue,
    provider: providerRevenue,
    affiliate: affiliateRevenue,
    ib: ibRevenueAmount,
    referralCost,
    paymentFees,
    net: netRevenue,
  };
}
async function getGrowthBreakdown({ from, to, granularity }) {
  const [users, providers, traders, volume] = await Promise.all([
    userGrowthService.getGrowth({ from, to, granularity }),
    providerGrowthService.getGrowth({ from, to, granularity }),
    traderGrowthService.getGrowth({ from, to, granularity }),
    volumeGrowthService.getGrowth({ from, to, granularity }),
  ]);

  return { users, providers, traders, volume };
}
async function getRetentionMetrics({ from, to }) {
  return retentionService.getRetention({ from, to });
}
async function getConversionMetrics({ from, to }) {
  return conversionService.getConversion({ from, to });
}
async function getFinancialReport({ from, to, granularity }) {
  return financialReportService.generateReport({ from, to, granularity });
}
const executiveService = {
  getExecutiveDashboard,
  getRevenueBreakdown,
  getGrowthBreakdown,
  getRetentionMetrics,
  getConversionMetrics,
  getFinancialReport,
};
module.exports.executiveService = executiveService;

module.exports.getExecutiveDashboard = getExecutiveDashboard;

module.exports.getRevenueBreakdown = getRevenueBreakdown;

module.exports.getGrowthBreakdown = getGrowthBreakdown;

module.exports.getRetentionMetrics = getRetentionMetrics;

module.exports.getConversionMetrics = getConversionMetrics;

module.exports.getFinancialReport = getFinancialReport;
