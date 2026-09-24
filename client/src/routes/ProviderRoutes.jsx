/**
 * Provider Routes
 *
 * Provider Business console routes. Uses the ProviderLayout which
 * extends UserLayout with provider-specific navigation.
 *
 * @module client/src/routes/ProviderRoutes
 */

import { Route } from 'react-router-dom';

import ProviderLayout from '../layouts/ProviderLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

import ProviderDashboard from '../features/provider-business/ProviderDashboard.jsx';
import ProviderProfileManagement from '../features/provider-business/ProviderProfileManagement.jsx';
import ProviderSubscribers from '../features/provider-business/ProviderSubscribers.jsx';
import ProviderRevenue from '../features/provider-business/ProviderRevenue.jsx';
import ProviderAnalytics from '../features/provider-business/ProviderAnalytics.jsx';
import ProviderSignalsManagement from '../features/provider-business/ProviderSignalsManagement.jsx';
import ProviderDnaManagement from '../features/provider-business/ProviderDnaManagement.jsx';
import ProviderCertificationManagement from '../features/provider-business/ProviderCertificationManagement.jsx';
import ProviderSubscriptionPlans from '../features/provider-business/ProviderSubscriptionPlans.jsx';
import ProviderWithdrawals from '../features/provider-business/ProviderWithdrawals.jsx';
import ProviderIbManagement from '../features/provider-business/ProviderIbManagement.jsx';
import ProviderAffiliateManagement from '../features/provider-business/ProviderAffiliateManagement.jsx';
import ProviderMarketingTools from '../features/provider-business/ProviderMarketingTools.jsx';
import ProviderPromotions from '../features/provider-business/ProviderPromotions.jsx';
import ProviderReviewsManagement from '../features/provider-business/ProviderReviewsManagement.jsx';
import ProviderSettings from '../features/provider-business/ProviderSettings.jsx';

import CertificationDashboard from '../features/provider-certification/CertificationDashboard.jsx';
import ImportHistoricalMessages from '../features/provider-certification/ImportHistoricalMessages.jsx';
import TrainingDataset from '../features/provider-certification/TrainingDataset.jsx';
import ParsingAccuracy from '../features/provider-certification/ParsingAccuracy.jsx';
import Backtesting from '../features/provider-certification/Backtesting.jsx';
import ExpectedPerformance from '../features/provider-certification/ExpectedPerformance.jsx';
import RiskAssessment from '../features/provider-certification/RiskAssessment.jsx';
import ConsistencyScore from '../features/provider-certification/ConsistencyScore.jsx';
import QualityScore from '../features/provider-certification/QualityScore.jsx';
import CertificationResult from '../features/provider-certification/CertificationResult.jsx';
import CertificationHistory from '../features/provider-certification/CertificationHistory.jsx';

import AffiliateDashboard from '../features/affiliate/AffiliateDashboard.jsx';
import AffiliateLinks from '../features/affiliate/AffiliateLinks.jsx';
import AffiliateReferrals from '../features/affiliate/AffiliateReferrals.jsx';
import AffiliateCommissions from '../features/affiliate/AffiliateCommissions.jsx';

import IbDashboard from '../features/ib/IbDashboard.jsx';
import BrokerReferralLinks from '../features/ib/BrokerReferralLinks.jsx';
import IbReferrals from '../features/ib/IbReferrals.jsx';
import IbRevenue from '../features/ib/IbRevenue.jsx';
import CommissionHistory from '../features/ib/CommissionHistory.jsx';

import WhiteLabelDashboard from '../features/white-label/WhiteLabelDashboard.jsx';
import BrandConfiguration from '../features/white-label/BrandConfiguration.jsx';
import LogoBranding from '../features/white-label/LogoBranding.jsx';
import DomainConfiguration from '../features/white-label/DomainConfiguration.jsx';
import ThemeConfiguration from '../features/white-label/ThemeConfiguration.jsx';
import CustomPricing from '../features/white-label/CustomPricing.jsx';
import WhiteLabelAnalytics from '../features/white-label/WhiteLabelAnalytics.jsx';
import WhiteLabelUsers from '../features/white-label/WhiteLabelUsers.jsx';
import WhiteLabelRevenue from '../features/white-label/WhiteLabelRevenue.jsx';
import WhiteLabelSettings from '../features/white-label/WhiteLabelSettings.jsx';

export default function ProviderRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<RoleRoute allowed={['PROVIDER', 'ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<ProviderLayout />}>
          <Route path="/provider" element={<ProviderDashboard />} />
          <Route path="/provider/profile" element={<ProviderProfileManagement />} />
          <Route path="/provider/subscribers" element={<ProviderSubscribers />} />
          <Route path="/provider/revenue" element={<ProviderRevenue />} />
          <Route path="/provider/analytics" element={<ProviderAnalytics />} />
          <Route path="/provider/signals" element={<ProviderSignalsManagement />} />
          <Route path="/provider/dna" element={<ProviderDnaManagement />} />
          <Route path="/provider/certification" element={<ProviderCertificationManagement />} />
          <Route path="/provider/plans" element={<ProviderSubscriptionPlans />} />
          <Route path="/provider/withdrawals" element={<ProviderWithdrawals />} />
          <Route path="/provider/ib" element={<ProviderIbManagement />} />
          <Route path="/provider/affiliate" element={<ProviderAffiliateManagement />} />
          <Route path="/provider/marketing" element={<ProviderMarketingTools />} />
          <Route path="/provider/promotions" element={<ProviderPromotions />} />
          <Route path="/provider/reviews" element={<ProviderReviewsManagement />} />
          <Route path="/provider/settings" element={<ProviderSettings />} />

          <Route path="/provider-certification" element={<CertificationDashboard />} />
          <Route path="/provider-certification/import" element={<ImportHistoricalMessages />} />
          <Route path="/provider-certification/dataset" element={<TrainingDataset />} />
          <Route path="/provider-certification/parsing" element={<ParsingAccuracy />} />
          <Route path="/provider-certification/backtesting" element={<Backtesting />} />
          <Route path="/provider-certification/performance" element={<ExpectedPerformance />} />
          <Route path="/provider-certification/risk" element={<RiskAssessment />} />
          <Route path="/provider-certification/consistency" element={<ConsistencyScore />} />
          <Route path="/provider-certification/quality" element={<QualityScore />} />
          <Route path="/provider-certification/result" element={<CertificationResult />} />
          <Route path="/provider-certification/history" element={<CertificationHistory />} />

          <Route path="/affiliate" element={<AffiliateDashboard />} />
          <Route path="/affiliate/links" element={<AffiliateLinks />} />
          <Route path="/affiliate/referrals" element={<AffiliateReferrals />} />
          <Route path="/affiliate/commissions" element={<AffiliateCommissions />} />

          <Route path="/ib" element={<IbDashboard />} />
          <Route path="/ib/links" element={<BrokerReferralLinks />} />
          <Route path="/ib/referrals" element={<IbReferrals />} />
          <Route path="/ib/revenue" element={<IbRevenue />} />
          <Route path="/ib/commissions" element={<CommissionHistory />} />

          <Route path="/white-label" element={<WhiteLabelDashboard />} />
          <Route path="/white-label/branding" element={<BrandConfiguration />} />
          <Route path="/white-label/logo" element={<LogoBranding />} />
          <Route path="/white-label/domains" element={<DomainConfiguration />} />
          <Route path="/white-label/theme" element={<ThemeConfiguration />} />
          <Route path="/white-label/pricing" element={<CustomPricing />} />
          <Route path="/white-label/analytics" element={<WhiteLabelAnalytics />} />
          <Route path="/white-label/users" element={<WhiteLabelUsers />} />
          <Route path="/white-label/revenue" element={<WhiteLabelRevenue />} />
          <Route path="/white-label/settings" element={<WhiteLabelSettings />} />
        </Route>
      </Route>
    </Route>
  );
}