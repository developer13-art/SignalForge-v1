import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import UserLayout from '../layouts/UserLayout';
import ProviderLayout from '../layouts/ProviderLayout';
import AdminLayout from '../layouts/AdminLayout';
import ComplianceLayout from '../layouts/ComplianceLayout';
import ExecutiveLayout from '../layouts/ExecutiveLayout';
import SupportLayout from '../layouts/SupportLayout';
import ProtectedRoute from '../routes/ProtectedRoute';
import KycRequiredRoute from '../routes/KycRequiredRoute';
import SubscriptionRequiredRoute from '../routes/SubscriptionRequiredRoute';
import RoleRoute from '../routes/RoleRoute';
import NotFoundRoute from '../routes/NotFoundRoute';
import LoadingState from '../components/common/LoadingState';

// Public
const Home = lazy(() => import('../features/public/Home'));
const HowItWorks = lazy(() => import('../features/public/HowItWorks'));
const Features = lazy(() => import('../features/public/Features'));
const Pricing = lazy(() => import('../features/public/Pricing'));
const About = lazy(() => import('../features/public/About'));
const Contact = lazy(() => import('../features/public/Contact'));
const Faq = lazy(() => import('../features/public/Faq'));
const Legal = lazy(() => import('../features/public/Legal'));
const Privacy = lazy(() => import('../features/public/Privacy'));
const Terms = lazy(() => import('../features/public/Terms'));

// Auth
const Login = lazy(() => import('../features/auth/Login'));
const Register = lazy(() => import('../features/auth/Register'));
const EmailVerification = lazy(() => import('../features/auth/EmailVerification'));
const ForgotPassword = lazy(() => import('../features/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../features/auth/ResetPassword'));
const TwoFactorSetup = lazy(() => import('../features/auth/TwoFactorSetup'));
const TwoFactorVerify = lazy(() => import('../features/auth/TwoFactorVerify'));

// KYC
const KycIntro = lazy(() => import('../features/kyc/KycIntro'));
const KycPersonalInfo = lazy(() => import('../features/kyc/KycPersonalInfo'));
const KycDocumentSelection = lazy(() => import('../features/kyc/KycDocumentSelection'));
const KycDocumentUpload = lazy(() => import('../features/kyc/KycDocumentUpload'));
const KycSelfieVerification = lazy(() => import('../features/kyc/KycSelfieVerification'));
const KycReviewStatus = lazy(() => import('../features/kyc/KycReviewStatus'));
const KycResult = lazy(() => import('../features/kyc/KycResult'));
const KycStatusDashboard = lazy(() => import('../features/kyc/KycStatusDashboard'));
const KycDocumentVerification = lazy(
  () => import('../features/kyc/KycDocumentVerification'),
);

// Dashboard
const DashboardOverview = lazy(() => import('../features/dashboard/DashboardOverview'));

// Signal Center
const LiveSignals = lazy(() => import('../features/signal-center/LiveSignals'));
const SignalHistory = lazy(() => import('../features/signal-center/SignalHistory'));
const SignalDetails = lazy(() => import('../features/signal-center/SignalDetails'));

// Signal Sources
const SignalSourcesOverview = lazy(() => import('../features/signal-sources/SignalSourcesOverview'));
const AddSignalSource = lazy(() => import('../features/signal-sources/AddSignalSource'));
const TelegramConnection = lazy(() => import('../features/signal-sources/TelegramConnection'));
const TelegramChannels = lazy(() => import('../features/signal-sources/TelegramChannels'));

// Trading
const TradingOverview = lazy(() => import('../features/trading/TradingOverview'));
const OpenPositions = lazy(() => import('../features/trading/OpenPositions'));
const TradeHistory = lazy(() => import('../features/trading/TradeHistory'));
const TradeDetails = lazy(() => import('../features/trading/TradeDetails'));

// Brokers
const BrokerAccounts = lazy(() => import('../features/brokers/BrokerAccounts'));
const ConnectBroker = lazy(() => import('../features/brokers/ConnectBroker'));
const Mt4Connection = lazy(() => import('../features/brokers/Mt4Connection'));
const Mt5Connection = lazy(() => import('../features/brokers/Mt5Connection'));

// Analytics
const AnalyticsOverview = lazy(() => import('../features/analytics/AnalyticsOverview'));
const PerformanceDashboard = lazy(() => import('../features/analytics/PerformanceDashboard'));

// Provider Marketplace
const BrowseProviders = lazy(() => import('../features/provider-marketplace/BrowseProviders'));
const ProviderProfile = lazy(() => import('../features/provider-marketplace/ProviderProfile'));

// Referrals
const ReferralDashboard = lazy(() => import('../features/referrals/ReferralDashboard'));

// Subscriptions
const PricingPlans = lazy(() => import('../features/subscriptions/PricingPlans'));
const MySubscription = lazy(() => import('../features/subscriptions/MySubscription'));

// Wallet
const WalletOverview = lazy(() => import('../features/wallet/WalletOverview'));

// Settings
const ProfileSettings = lazy(() => import('../features/settings/ProfileSettings'));
const SecuritySettings = lazy(() => import('../features/settings/SecuritySettings'));
const SettingsLayout = lazy(() => import('../features/settings/SettingsLayout'));
const AccountSettings = lazy(() => import('../features/settings/AccountSettings'));
const TwoFactorSettings = lazy(() => import('../features/settings/TwoFactorSettings'));
const ConnectedDevices = lazy(() => import('../features/settings/ConnectedDevices'));
const ConnectedAccounts = lazy(() => import('../features/settings/ConnectedAccounts'));
const BrokerSettings = lazy(() => import('../features/settings/BrokerSettings'));
const SignalSourceSettings = lazy(() => import('../features/settings/SignalSourceSettings'));
const TradingPreferences = lazy(() => import('../features/settings/TradingPreferences'));
const RiskPreferences = lazy(() => import('../features/settings/RiskPreferences'));
const NotificationSettings = lazy(() => import('../features/settings/NotificationSettings'));
const PrivacySettings = lazy(() => import('../features/settings/PrivacySettings'));
const ApiKeys = lazy(() => import('../features/settings/ApiKeys'));
const DataPrivacy = lazy(() => import('../features/settings/DataPrivacy'));
const DeleteAccount = lazy(() => import('../features/settings/DeleteAccount'));

// ---------------------------------------------------------------------
// Feature A — Solana Actions & Blinks
// ---------------------------------------------------------------------
const BlinkBuilder = lazy(() => import('../features/solana/blinks/BlinkBuilder'));
const BlinkHistory = lazy(() => import('../features/solana/blinks/BlinkHistory'));
const BlinkDetails = lazy(() => import('../features/solana/blinks/BlinkDetails'));

// ---------------------------------------------------------------------
// Feature B — Proof of Alpha
// ---------------------------------------------------------------------
const ProofOfAlphaOverview = lazy(
  () => import('../features/proof-of-alpha/ProofOfAlphaOverview'),
);
const ProofExplorer = lazy(() => import('../features/proof-of-alpha/ProofExplorer'));
const ProviderProofHistory = lazy(
  () => import('../features/proof-of-alpha/ProviderProofHistory'),
);
const ProofVerificationPage = lazy(
  () => import('../features/proof-of-alpha/ProofVerificationPage'),
);
const LeaderboardVerified = lazy(
  () => import('../features/proof-of-alpha/LeaderboardVerified'),
);

// ---------------------------------------------------------------------
// Feature C — Hybrid Execution Engine / Crypto Trading
// ---------------------------------------------------------------------
const CryptoTradingOverview = lazy(
  () => import('../features/crypto-trading/CryptoTradingOverview'),
);
const CryptoPositions = lazy(() => import('../features/crypto-trading/CryptoPositions'));
const CryptoOrders = lazy(() => import('../features/crypto-trading/CryptoOrders'));
const CryptoHistory = lazy(() => import('../features/crypto-trading/CryptoHistory'));

// ---------------------------------------------------------------------
// Admin consoles
// ---------------------------------------------------------------------
const AdminOverview = lazy(() => import('../features/admin/AdminOverview'));
const UserManagement = lazy(() => import('../features/admin/UserManagement'));
const KycManagement = lazy(() => import('../features/admin/KycManagement'));
const KycApplicationReview = lazy(() => import('../features/admin/KycApplicationReview'));
const ProviderManagement = lazy(() => import('../features/admin/ProviderManagement'));
const BrokerManagement = lazy(() => import('../features/admin/BrokerManagement'));
const LiveTradeMonitor = lazy(() => import('../features/admin/LiveTradeMonitor'));
const AuditLogs = lazy(() => import('../features/admin/AuditLogs'));
const SystemSettings = lazy(() => import('../features/admin/SystemSettings'));
const UserDetails = lazy(() => import('../features/admin/UserDetails'));
const UserRestrictions = lazy(() => import('../features/admin/UserRestrictions'));
const TraderManagement = lazy(() => import('../features/admin/TraderManagement'));
const SignalSourceManagement = lazy(() => import('../features/admin/SignalSourceManagement'));
const LiveSignalMonitor = lazy(() => import('../features/admin/LiveSignalMonitor'));
const AiMonitoring = lazy(() => import('../features/admin/AiMonitoring'));
const ProviderDnaMonitoring = lazy(() => import('../features/admin/ProviderDnaMonitoring'));
const RiskMonitoring = lazy(() => import('../features/admin/RiskMonitoring'));
const ReferralManagement = lazy(() => import('../features/admin/ReferralManagement'));
const SubscriptionManagement = lazy(() => import('../features/admin/SubscriptionManagement'));
const PaymentManagement = lazy(() => import('../features/admin/PaymentManagement'));
const WithdrawalManagement = lazy(() => import('../features/admin/WithdrawalManagement'));
const AffiliateManagement = lazy(() => import('../features/admin/AffiliateManagement'));
const MarketplaceModeration = lazy(() => import('../features/admin/MarketplaceModeration'));
const Reports = lazy(() => import('../features/admin/Reports'));
const SystemAnalytics = lazy(() => import('../features/admin/SystemAnalytics'));
const SecurityCenter = lazy(() => import('../features/admin/SecurityCenter'));
const AutomationRules = lazy(() => import('../features/risk-automation/AutomationRules'));
const BrowseTraders = lazy(() => import('../features/trader-marketplace/BrowseTraders'));
const TraderProfile = lazy(() => import('../features/trader-marketplace/TraderProfile'));
const TraderReviews = lazy(() => import('../features/trader-marketplace/TraderReviews'));
const NotificationCenter = lazy(() => import('../features/notifications/NotificationCenter'));
const ComplianceDashboard = lazy(
  () => import('../features/compliance/ComplianceDashboard'),
);
const KycQueue = lazy(() => import('../features/compliance/KycQueue'));
const ExecutiveDashboard = lazy(
  () => import('../features/executive/ExecutiveDashboard'),
);
const SupportDashboard = lazy(() => import('../features/support/SupportDashboard'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingState fullscreen />}>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Public on-chain verification — no auth required */}
            <Route path="/verify/:signature" element={<ProofVerificationPage />} />
            <Route path="/verify" element={<ProofVerificationPage />} />

            {/* Public provider proof history */}
            <Route
              path="/providers/:providerId/proofs"
              element={<ProviderProofHistory />}
            />

            {/* Public verified leaderboard */}
            <Route path="/leaderboard" element={<LeaderboardVerified />} />
          </Route>

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/2fa/setup" element={<TwoFactorSetup />} />
            <Route path="/2fa/verify" element={<TwoFactorVerify />} />
          </Route>

          {/* Authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardOverview />} />

              {/* KYC */}
              <Route path="/kyc" element={<KycIntro />} />
              <Route path="/kyc/personal" element={<KycPersonalInfo />} />
              <Route path="/kyc/personal-info" element={<KycPersonalInfo />} />
              <Route path="/kyc/document" element={<KycDocumentSelection />} />
              <Route path="/kyc/upload" element={<KycDocumentUpload />} />
              <Route path="/kyc/selfie" element={<KycSelfieVerification />} />
              <Route path="/kyc/review" element={<KycReviewStatus />} />
              <Route path="/kyc/result" element={<KycResult />} />
              <Route path="/kyc/status" element={<KycStatusDashboard />} />
              <Route path="/kyc/document-selection" element={<KycDocumentSelection />} />
              <Route path="/kyc/document-upload" element={<KycDocumentUpload />} />
              <Route path="/kyc/document-verification" element={<KycDocumentVerification />} />
              <Route path="/kyc/selfie-verification" element={<KycSelfieVerification />} />
              <Route path="/kyc/review-status" element={<KycReviewStatus />} />

              {/* Signals */}
              <Route path="/signals" element={<LiveSignals />} />
              <Route path="/signals/live" element={<LiveSignals />} />
              <Route path="/signals/history" element={<SignalHistory />} />
              <Route path="/signals/:signalId" element={<SignalDetails />} />

              {/* Signal sources */}
              <Route path="/signal-sources" element={<SignalSourcesOverview />} />
              <Route path="/signal-sources/add" element={<AddSignalSource />} />
              <Route path="/signal-sources/telegram" element={<TelegramConnection />} />
              <Route path="/signal-sources/telegram/channels" element={<TelegramChannels />} />
              <Route path="/sources" element={<SignalSourcesOverview />} />
              <Route path="/sources/add" element={<AddSignalSource />} />
              <Route path="/sources/telegram" element={<TelegramConnection />} />
              <Route path="/sources/telegram/channels" element={<TelegramChannels />} />

              {/* Trading */}
              <Route path="/trading" element={<TradingOverview />} />
              <Route path="/trading/positions" element={<OpenPositions />} />
              <Route path="/trading/history" element={<TradeHistory />} />
              <Route path="/trading/:tradeId" element={<TradeDetails />} />

              {/* Brokers */}
              <Route path="/brokers" element={<BrokerAccounts />} />
              <Route path="/brokers/connect" element={<ConnectBroker />} />
              <Route path="/brokers/mt4" element={<Mt4Connection />} />
              <Route path="/brokers/mt5" element={<Mt5Connection />} />

              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsOverview />} />
              <Route path="/analytics/performance" element={<PerformanceDashboard />} />

              {/* Providers marketplace */}
              <Route path="/marketplace/providers" element={<BrowseProviders />} />
              <Route path="/marketplace/providers/:providerId" element={<ProviderProfile />} />
              <Route path="/providers" element={<BrowseProviders />} />
              <Route path="/providers/:providerId" element={<ProviderProfile />} />

              {/* Trader marketplace */}
              <Route path="/marketplace/traders" element={<BrowseTraders />} />
              <Route path="/marketplace/traders/:traderId" element={<TraderProfile />} />
              <Route path="/marketplace/traders/:traderId/reviews" element={<TraderReviews />} />

              {/* Notifications and automation */}
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/automation/rules" element={<AutomationRules />} />

              {/* Referrals */}
              <Route path="/referrals" element={<ReferralDashboard />} />

              {/* Subscriptions */}
              <Route path="/subscriptions" element={<MySubscription />} />
              <Route path="/subscriptions/plans" element={<PricingPlans />} />

              {/* Wallet */}
              <Route path="/wallet" element={<WalletOverview />} />

              {/* Settings */}
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="/settings/profile" replace />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="account" element={<AccountSettings />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="2fa" element={<TwoFactorSettings />} />
                <Route path="devices" element={<ConnectedDevices />} />
                <Route path="accounts" element={<ConnectedAccounts />} />
                <Route path="brokers" element={<BrokerSettings />} />
                <Route path="signal-sources" element={<SignalSourceSettings />} />
                <Route path="trading" element={<TradingPreferences />} />
                <Route path="risk" element={<RiskPreferences />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route path="privacy" element={<PrivacySettings />} />
                <Route path="api-keys" element={<ApiKeys />} />
                <Route path="data-privacy" element={<DataPrivacy />} />
                <Route path="delete-account" element={<DeleteAccount />} />
              </Route>

              {/* Feature A — Blinks */}
              <Route path="/solana/blinks" element={<BlinkHistory />} />
              <Route path="/solana/blinks/create" element={<BlinkBuilder />} />
              <Route path="/solana/blinks/:blinkId" element={<BlinkDetails />} />

              {/* Feature B — Proof of Alpha */}
              <Route
                path="/proof-of-alpha"
                element={<ProofOfAlphaOverview />}
              />
              <Route path="/proof-of-alpha/explorer" element={<ProofExplorer />} />
              <Route
                path="/proof-of-alpha/provider/:providerId"
                element={<ProviderProofHistory />}
              />

              {/* Feature C — Crypto Trading */}
              <Route path="/crypto-trading" element={<CryptoTradingOverview />} />
              <Route
                path="/crypto-trading/positions"
                element={<CryptoPositions />}
              />
              <Route path="/crypto-trading/orders" element={<CryptoOrders />} />
              <Route path="/crypto-trading/history" element={<CryptoHistory />} />
            </Route>
          </Route>

          {/* Provider business platform */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowed={['PROVIDER', 'ADMIN', 'SUPER_ADMIN']} />}>
              <Route element={<ProviderLayout />}>
                <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
                {/* Provider pages are declared in the provider layout block; only the entry point is listed here. */}
              </Route>
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowed={['ADMIN', 'SUPER_ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/users/:userId" element={<UserDetails />} />
                <Route path="/admin/users/:userId/restrictions" element={<UserRestrictions />} />
                <Route path="/admin/kyc" element={<KycManagement />} />
                <Route path="/admin/kyc/:applicationId" element={<KycApplicationReview />} />
                <Route path="/admin/providers" element={<ProviderManagement />} />
                <Route path="/admin/traders" element={<TraderManagement />} />
                <Route path="/admin/signal-sources" element={<SignalSourceManagement />} />
                <Route path="/admin/brokers" element={<BrokerManagement />} />
                <Route path="/admin/signals/monitor" element={<LiveSignalMonitor />} />
                <Route path="/admin/trades/monitor" element={<LiveTradeMonitor />} />
                <Route path="/admin/ai" element={<AiMonitoring />} />
                <Route path="/admin/provider-dna" element={<ProviderDnaMonitoring />} />
                <Route path="/admin/risk" element={<RiskMonitoring />} />
                <Route path="/admin/referrals" element={<ReferralManagement />} />
                <Route path="/admin/subscriptions" element={<SubscriptionManagement />} />
                <Route path="/admin/payments" element={<PaymentManagement />} />
                <Route path="/admin/withdrawals" element={<WithdrawalManagement />} />
                <Route path="/admin/affiliate" element={<AffiliateManagement />} />
                <Route path="/admin/marketplace" element={<MarketplaceModeration />} />
                <Route path="/admin/marketplace/reviews" element={<MarketplaceModeration />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/analytics" element={<SystemAnalytics />} />
                <Route path="/admin/security" element={<SecurityCenter />} />
                <Route path="/admin/trades" element={<LiveTradeMonitor />} />
                <Route path="/admin/audit-logs" element={<AuditLogs />} />
                <Route path="/admin/settings" element={<SystemSettings />} />
              </Route>
            </Route>
          </Route>

          {/* Compliance */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={<RoleRoute allowed={['COMPLIANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN']} />}
            >
              <Route element={<ComplianceLayout />}>
                <Route path="/compliance" element={<ComplianceDashboard />} />
                <Route path="/compliance/kyc-queue" element={<KycQueue />} />
              </Route>
            </Route>
          </Route>

          {/* Executive */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowed={['ADMIN', 'SUPER_ADMIN', 'FINANCE_ADMIN']} />}>
              <Route element={<ExecutiveLayout />}>
                <Route path="/executive" element={<ExecutiveDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* Support */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <RoleRoute
                  allowed={['SUPPORT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']}
                />
              }
            >
              <Route element={<SupportLayout />}>
                <Route path="/support" element={<SupportDashboard />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}