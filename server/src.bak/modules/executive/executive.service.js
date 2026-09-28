/**
 * Executive Service
 *
 * Top-level orchestration for executive-level analytics. Combines
 * revenue, growth, and retention into a single dashboard view.
 *
 * @module server/modules/executive/executive.service
 */

import { AppError } from '../../lib/errors/app-error';
import { ERROR_CODES } from '../../lib/errors/error-codes';
import * as repository from './executive.repository';
import { subscriptionRevenueService } from './revenue/subscription-revenue.service';
import { marketplaceRevenueService } from './revenue/marketplace-revenue.service';
import { providerRevenueService } from './revenue/provider-revenue.service';
import { affiliateRevenueService } from './revenue/affiliate-revenue.service';
import { ibRevenueService } from './revenue/ib-revenue.service';
import { referralCostService } from './revenue/referral-cost.service';
import { paymentFeesService } from './revenue/payment-fees.service';
import { netRevenueService } from './revenue/net-revenue.service';
import { userGrowthService } from './growth/user-growth.service';
import { providerGrowthService } from './growth/provider-growth.service';
import { traderGrowthService } from './growth/trader-growth.service';
import { volumeGrowthService } from './growth/volume-growth.service';
import { retentionService } from './analytics/retention.service';
import { conversionService } from './analytics/conversion.service';
import { financialReportService } from './analytics/financial-report.service';

export async function getExecutiveDashboard({ from, to }) {
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

export async function getRevenueBreakdown({ from, to }) {
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

export async function getGrowthBreakdown({ from, to, granularity }) {
  const [users, providers, traders, volume] = await Promise.all([
    userGrowthService.getGrowth({ from, to, granularity }),
    providerGrowthService.getGrowth({ from, to, granularity }),
    traderGrowthService.getGrowth({ from, to, granularity }),
    volumeGrowthService.getGrowth({ from, to, granularity }),
  ]);

  return { users, providers, traders, volume };
}

export async function getRetentionMetrics({ from, to }) {
  return retentionService.getRetention({ from, to });
}

export async function getConversionMetrics({ from, to }) {
  return conversionService.getConversion({ from, to });
}

export async function getFinancialReport({ from, to, granularity }) {
  return financialReportService.generateReport({ from, to, granularity });
}

export const executiveService = {
  getExecutiveDashboard,
  getRevenueBreakdown,
  getGrowthBreakdown,
  getRetentionMetrics,
  getConversionMetrics,
  getFinancialReport,
};