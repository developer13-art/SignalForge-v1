/**
 * Executive Routes
 *
 * Executive / Business Intelligence console routes. Requires ADMIN
 * or SUPER_ADMIN role.
 *
 * @module client/src/routes/ExecutiveRoutes
 */

import { Route } from 'react-router-dom';

import ExecutiveLayout from '../layouts/ExecutiveLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

import ExecutiveDashboard from '../features/executive/ExecutiveDashboard.jsx';
import SubscriptionRevenue from '../features/executive/SubscriptionRevenue.jsx';
import MarketplaceRevenue from '../features/executive/MarketplaceRevenue.jsx';
import ProviderRevenue from '../features/executive/ProviderRevenue.jsx';
import AffiliateRevenue from '../features/executive/AffiliateRevenue.jsx';
import IbRevenue from '../features/executive/IbRevenue.jsx';
import ReferralCost from '../features/executive/ReferralCost.jsx';
import NetPlatformRevenue from '../features/executive/NetPlatformRevenue.jsx';
import UserGrowth from '../features/executive/UserGrowth.jsx';
import ProviderGrowth from '../features/executive/ProviderGrowth.jsx';
import TraderGrowth from '../features/executive/TraderGrowth.jsx';
import TradingVolume from '../features/executive/TradingVolume.jsx';
import PlatformPerformance from '../features/executive/PlatformPerformance.jsx';
import RetentionAnalytics from '../features/executive/RetentionAnalytics.jsx';
import ConversionAnalytics from '../features/executive/ConversionAnalytics.jsx';
import FinancialReports from '../features/executive/FinancialReports.jsx';

export default function ExecutiveRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<RoleRoute allowed={['ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<ExecutiveLayout />}>
          <Route path="/executive" element={<ExecutiveDashboard />} />
          <Route path="/executive/revenue/subscriptions" element={<SubscriptionRevenue />} />
          <Route path="/executive/revenue/marketplace" element={<MarketplaceRevenue />} />
          <Route path="/executive/revenue/providers" element={<ProviderRevenue />} />
          <Route path="/executive/revenue/affiliate" element={<AffiliateRevenue />} />
          <Route path="/executive/revenue/ib" element={<IbRevenue />} />
          <Route path="/executive/revenue/referral-cost" element={<ReferralCost />} />
          <Route path="/executive/revenue/net" element={<NetPlatformRevenue />} />
          <Route path="/executive/growth/users" element={<UserGrowth />} />
          <Route path="/executive/growth/providers" element={<ProviderGrowth />} />
          <Route path="/executive/growth/traders" element={<TraderGrowth />} />
          <Route path="/executive/volume" element={<TradingVolume />} />
          <Route path="/executive/performance" element={<PlatformPerformance />} />
          <Route path="/executive/retention" element={<RetentionAnalytics />} />
          <Route path="/executive/conversion" element={<ConversionAnalytics />} />
          <Route path="/executive/financial-reports" element={<FinancialReports />} />
        </Route>
      </Route>
    </Route>
  );
}