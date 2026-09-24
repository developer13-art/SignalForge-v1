/**
 * Admin Routes
 *
 * Administrative console routes. Requires ADMIN or SUPER_ADMIN role.
 *
 * @module client/src/routes/AdminRoutes
 */

import { Route } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

import AdminOverview from '../features/admin/AdminOverview.jsx';
import UserManagement from '../features/admin/UserManagement.jsx';
import UserDetails from '../features/admin/UserDetails.jsx';
import UserRestrictions from '../features/admin/UserRestrictions.jsx';
import KycManagement from '../features/admin/KycManagement.jsx';
import ProviderManagement from '../features/admin/ProviderManagement.jsx';
import TraderManagement from '../features/admin/TraderManagement.jsx';
import SignalSourceManagement from '../features/admin/SignalSourceManagement.jsx';
import BrokerManagement from '../features/admin/BrokerManagement.jsx';
import LiveTradeMonitor from '../features/admin/LiveTradeMonitor.jsx';
import LiveSignalMonitor from '../features/admin/LiveSignalMonitor.jsx';
import AiMonitoring from '../features/admin/AiMonitoring.jsx';
import ProviderDnaMonitoring from '../features/admin/ProviderDnaMonitoring.jsx';
import RiskMonitoring from '../features/admin/RiskMonitoring.jsx';
import ReferralManagement from '../features/admin/ReferralManagement.jsx';
import SubscriptionManagement from '../features/admin/SubscriptionManagement.jsx';
import PaymentManagement from '../features/admin/PaymentManagement.jsx';
import WithdrawalManagement from '../features/admin/WithdrawalManagement.jsx';
import AffiliateManagement from '../features/admin/AffiliateManagement.jsx';
import MarketplaceModeration from '../features/admin/MarketplaceModeration.jsx';
import Reports from '../features/admin/Reports.jsx';
import SystemAnalytics from '../features/admin/SystemAnalytics.jsx';
import AuditLogs from '../features/admin/AuditLogs.jsx';
import SecurityCenter from '../features/admin/SecurityCenter.jsx';
import SystemSettings from '../features/admin/SystemSettings.jsx';

export default function AdminRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<RoleRoute allowed={['ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/:userId" element={<UserDetails />} />
          <Route path="/admin/users/:userId/restrictions" element={<UserRestrictions />} />
          <Route path="/admin/kyc" element={<KycManagement />} />
          <Route path="/admin/providers" element={<ProviderManagement />} />
          <Route path="/admin/traders" element={<TraderManagement />} />
          <Route path="/admin/signal-sources" element={<SignalSourceManagement />} />
          <Route path="/admin/brokers" element={<BrokerManagement />} />
          <Route path="/admin/trades/monitor" element={<LiveTradeMonitor />} />
          <Route path="/admin/signals/monitor" element={<LiveSignalMonitor />} />
          <Route path="/admin/ai" element={<AiMonitoring />} />
          <Route path="/admin/provider-dna" element={<ProviderDnaMonitoring />} />
          <Route path="/admin/risk" element={<RiskMonitoring />} />
          <Route path="/admin/referrals" element={<ReferralManagement />} />
          <Route path="/admin/subscriptions" element={<SubscriptionManagement />} />
          <Route path="/admin/payments" element={<PaymentManagement />} />
          <Route path="/admin/withdrawals" element={<WithdrawalManagement />} />
          <Route path="/admin/affiliate" element={<AffiliateManagement />} />
          <Route path="/admin/marketplace" element={<MarketplaceModeration />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/analytics" element={<SystemAnalytics />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/security" element={<SecurityCenter />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
        </Route>
      </Route>
    </Route>
  );
}