/**
 * Sidebar
 *
 * Responsive navigation sidebar. Collapses to icons on desktop when
 * the user prefers a compact view, and slides in as a drawer on
 * mobile. Navigation content is variant-aware so the same component
 * powers the user, provider, admin, compliance, executive, and
 * support shells.
 *
 * @module client/src/layouts/components/Sidebar
 */

import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  ArrowLeftRight,
  Wallet as WalletIcon,
  ShieldAlert,
  Cpu,
  LineChart,
  Users,
  Store,
  Copy,
  Coins,
  Gift,
  Bell,
  Settings,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

import logo from '@assets/icons/svg/logo.svg';
import { routes } from '@config/routes.config.js';

const USER_NAV = [
  { label: 'Dashboard', to: routes.user.dashboard, icon: LayoutDashboard },
  { label: 'Signals', to: routes.user.signalCenter.root, icon: Activity, badgeKey: 'signals' },
  { label: 'Trades', to: routes.user.trading.overview, icon: ArrowLeftRight },
  { label: 'Positions', to: routes.user.trading.openPositions, icon: WalletIcon },
  { label: 'Risk Management', to: routes.user.riskAutomation.overview, icon: ShieldAlert },
  { label: 'Automation', to: routes.user.riskAutomation.automationRules, icon: Cpu },
  { label: 'AI Intelligence', to: routes.user.aiIntelligence.overview, icon: Sparkles },
  { label: 'Brokers', to: routes.user.brokers.accounts, icon: Store, badgeKey: 'brokers' },
  { label: 'Analytics', to: routes.user.analytics.overview, icon: LineChart },
  { label: 'Marketplace', to: routes.user.providerMarketplace.browse, icon: Users },
  { label: 'Copy Trading', to: routes.user.traderMarketplace.browse, icon: Copy },
  { label: 'Wallet', to: routes.user.wallet.overview, icon: Coins },
  { label: 'Referrals', to: routes.user.referrals.dashboard, icon: Gift },
  { label: 'Notifications', to: routes.user.notifications.center, icon: Bell, badgeKey: 'notifications' },
  { label: 'Settings', to: routes.user.settings.profile, icon: Settings },
];

const PROVIDER_NAV = [
  { label: 'Dashboard', to: routes.providerBusiness.dashboard, icon: LayoutDashboard },
  { label: 'Signals', to: routes.providerBusiness.signals, icon: Activity },
  { label: 'Subscribers', to: routes.providerBusiness.subscribers, icon: Users },
  { label: 'Revenue', to: routes.providerBusiness.revenue, icon: Coins },
  { label: 'Analytics', to: routes.providerBusiness.analytics, icon: LineChart },
  { label: 'Provider DNA', to: routes.providerBusiness.dna, icon: Sparkles },
  { label: 'Certification', to: routes.providerCertification.dashboard, icon: ShieldAlert },
  { label: 'Subscription Plans', to: routes.providerBusiness.plans, icon: Store },
  { label: 'Withdrawals', to: routes.providerBusiness.withdrawals, icon: Coins },
  { label: 'IB Management', to: routes.providerBusiness.ib, icon: Users },
  { label: 'Affiliate', to: routes.providerBusiness.affiliate, icon: Gift },
  { label: 'Marketing', to: routes.providerBusiness.marketing, icon: Sparkles },
  { label: 'Reviews', to: routes.providerBusiness.reviews, icon: Activity },
  { label: 'Notifications', to: routes.user.notifications.center, icon: Bell, badgeKey: 'notifications' },
  { label: 'Settings', to: routes.providerBusiness.settings, icon: Settings },
];

const ADMIN_NAV_GROUPS = [
  {
    label: 'Platform Management',
    items: [
      { label: 'Dashboard', to: routes.admin.overview, icon: LayoutDashboard },
      { label: 'Users', to: routes.admin.users, icon: Users },
      { label: 'KYC Management', to: routes.admin.kyc, icon: ShieldAlert },
      { label: 'Providers', to: routes.admin.providers, icon: Store },
      { label: 'Traders', to: routes.admin.traders, icon: Users },
      { label: 'Signals', to: routes.admin.liveSignalMonitor, icon: Activity, badgeKey: 'signals' },
      { label: 'Trading', to: routes.admin.liveTradeMonitor, icon: ArrowLeftRight },
      { label: 'Brokers', to: routes.admin.brokers, icon: Store },
      { label: 'Risk Management', to: routes.admin.riskMonitoring, icon: ShieldAlert },
      { label: 'AI & Intelligence', to: routes.admin.aiMonitoring, icon: Sparkles },
      { label: 'Automation', to: routes.user.riskAutomation.automationRules, icon: Cpu },
    ],
  },
  {
    label: 'Financial Management',
    items: [
      { label: 'Subscriptions', to: routes.admin.subscriptions, icon: Store },
      { label: 'Payments', to: routes.admin.payments, icon: Coins },
      { label: 'Wallet', to: routes.user.wallet.overview, icon: WalletIcon },
      { label: 'Withdrawals', to: routes.admin.withdrawals, icon: Coins },
      { label: 'Referrals & Rewards', to: routes.admin.referrals, icon: Gift },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Provider Marketplace', to: routes.admin.marketplaceModeration, icon: Store },
      { label: 'Trader Marketplace', to: routes.user.traderMarketplace.browse, icon: Users },
      { label: 'Reviews & Ratings', to: routes.admin.marketplaceModeration, icon: Activity },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Analytics', to: routes.admin.systemAnalytics, icon: LineChart },
      { label: 'Notifications', to: routes.user.notifications.center, icon: Bell, badgeKey: 'notifications' },
      { label: 'Audit Logs', to: routes.admin.auditLogs, icon: ShieldAlert },
      { label: 'System Settings', to: routes.admin.systemSettings, icon: Settings },
      { label: 'Security Center', to: routes.admin.securityCenter, icon: ShieldAlert },
    ],
  },
];

const COMPLIANCE_NAV = [
  { label: 'Dashboard', to: routes.compliance.dashboard, icon: LayoutDashboard },
  { label: 'KYC Queue', to: routes.compliance.kycQueue, icon: ShieldAlert, badgeKey: 'kyc' },
  { label: 'Pending Verification', to: routes.compliance.pending, icon: Users },
  { label: 'Under Review', to: routes.compliance.underReview, icon: Users },
  { label: 'Verified Users', to: routes.compliance.verified, icon: Users },
  { label: 'Rejected', to: routes.compliance.rejected, icon: Users },
  { label: 'Suspended', to: routes.compliance.suspended, icon: Users },
  { label: 'Document Types', to: routes.compliance.documentTypes, icon: Store },
  { label: 'Verification Providers', to: routes.compliance.verificationProviders, icon: Store },
  { label: 'Risk Flags', to: routes.compliance.riskFlags, icon: ShieldAlert },
  { label: 'Reports', to: routes.compliance.reports, icon: LineChart },
  { label: 'Audit Trail', to: routes.compliance.auditTrail, icon: ShieldAlert },
];

const EXECUTIVE_NAV = [
  { label: 'Dashboard', to: routes.executive.dashboard, icon: LayoutDashboard },
  { label: 'Subscription Revenue', to: routes.executive.subscriptionRevenue, icon: Coins },
  { label: 'Marketplace Revenue', to: routes.executive.marketplaceRevenue, icon: Coins },
  { label: 'Provider Revenue', to: routes.executive.providerRevenue, icon: Coins },
  { label: 'Affiliate Revenue', to: routes.executive.affiliateRevenue, icon: Coins },
  { label: 'IB Revenue', to: routes.executive.ibRevenue, icon: Coins },
  { label: 'Referral Cost', to: routes.executive.referralCost, icon: Gift },
  { label: 'Net Revenue', to: routes.executive.netRevenue, icon: LineChart },
  { label: 'User Growth', to: routes.executive.userGrowth, icon: Users },
  { label: 'Provider Growth', to: routes.executive.providerGrowth, icon: Users },
  { label: 'Trader Growth', to: routes.executive.traderGrowth, icon: Users },
  { label: 'Trading Volume', to: routes.executive.tradingVolume, icon: Activity },
  { label: 'Platform Performance', to: routes.executive.platformPerformance, icon: LineChart },
  { label: 'Retention', to: routes.executive.retention, icon: Users },
  { label: 'Conversion', to: routes.executive.conversion, icon: Activity },
  { label: 'Financial Reports', to: routes.executive.financialReports, icon: LineChart },
];

const SUPPORT_NAV = [
  { label: 'Help Center', to: routes.support.helpCenter, icon: LayoutDashboard },
  { label: 'Support Dashboard', to: routes.support.dashboard, icon: LayoutDashboard },
  { label: 'My Tickets', to: routes.support.myTickets, icon: Activity },
  { label: 'Create Ticket', to: routes.support.createTicket, icon: Sparkles },
  { label: 'Knowledge Base', to: routes.support.knowledgeBase, icon: Store },
  { label: 'Trading FAQ', to: routes.support.tradingFaq, icon: Activity },
  { label: 'KYC FAQ', to: routes.support.kycFaq, icon: ShieldAlert },
  { label: 'Billing FAQ', to: routes.support.billingFaq, icon: Coins },
  { label: 'Technical Support', to: routes.support.technicalSupport, icon: Settings },
];

function getNavForVariant(variant) {
  switch (variant) {
    case 'user':
      return { kind: 'flat', items: USER_NAV };
    case 'provider':
      return { kind: 'flat', items: PROVIDER_NAV };
    case 'admin':
      return { kind: 'grouped', groups: ADMIN_NAV_GROUPS };
    case 'compliance':
      return { kind: 'flat', items: COMPLIANCE_NAV };
    case 'executive':
      return { kind: 'flat', items: EXECUTIVE_NAV };
    case 'support':
      return { kind: 'flat', items: SUPPORT_NAV };
    default:
      return { kind: 'flat', items: USER_NAV };
  }
}

function NavItem({ item, collapsed }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        clsx(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-small font-medium transition',
          'border border-transparent',
          isActive
            ? 'bg-surface-elevated text-text-primary border-surface-border shadow-glow'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface hover:border-surface-border',
          collapsed && 'justify-center px-2',
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
      {!collapsed && item.badgeKey ? (
        <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-caption font-semibold text-white">
          {item.badgeKey === 'signals' ? 24 : item.badgeKey === 'brokers' ? 3 : item.badgeKey === 'notifications' ? 12 : null}
        </span>
      ) : null}
    </NavLink>
  );
}

export default function Sidebar({ variant = 'user', collapsed = false, mobileOpen = false, onCloseMobile }) {
  const nav = getNavForVariant(variant);

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-background-subtle border-r border-surface-border transition-transform duration-200',
          collapsed ? 'w-[76px]' : 'w-[264px]',
          'lg:static lg:translate-x-0 lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={clsx('flex items-center h-[68px] px-4 border-b border-surface-border', collapsed && 'justify-center')}>
          <Link to={routes.user.dashboard} className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="SignalForge" className="h-9 w-9 shrink-0" />
            {!collapsed ? (
              <div className="min-w-0">
                <p className="text-small font-semibold leading-tight truncate">SignalForge</p>
                <p className="text-caption text-text-tertiary leading-tight truncate">
                  {variant === 'admin'
                    ? 'Admin Control Center'
                    : variant === 'compliance'
                    ? 'Compliance Console'
                    : variant === 'executive'
                    ? 'Business Intelligence'
                    : variant === 'support'
                    ? 'Support Console'
                    : variant === 'provider'
                    ? 'Provider Business'
                    : 'Trading Intelligence'}
                </p>
              </div>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {nav.kind === 'flat'
            ? nav.items.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} />)
            : nav.groups.map((group) => (
                <div key={group.label} className="space-y-1">
                  {!collapsed ? (
                    <p className="px-3 text-caption font-semibold uppercase tracking-wider text-text-tertiary">
                      {group.label}
                    </p>
                  ) : null}
                  {group.items.map((item) => (
                    <NavItem key={item.to} item={item} collapsed={collapsed} />
                  ))}
                </div>
              ))}
        </nav>

        {variant === 'user' && !collapsed ? (
          <div className="px-3 pb-4">
            <div className="rounded-2xl border border-surface-border bg-gradient-card p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <p className="text-small font-semibold">Pro Plan</p>
              </div>
              <p className="mt-1 text-caption text-text-secondary">Renews in 23 days</p>
              <Link
                to={routes.user.subscriptions.mySubscription}
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-surface-elevated px-3 py-2 text-caption font-medium text-text-primary transition hover:bg-surface-hover"
              >
                Manage Plan
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}