/**
 * User Routes
 *
 * All authenticated user-facing routes: dashboard, signals, trading,
 * brokers, analytics, marketplaces, referrals, subscriptions, wallet,
 * notifications, settings, KYC, Solana, replay, and support.
 *
 * @module client/src/routes/UserRoutes
 */

import { Route } from 'react-router-dom';

import UserLayout from '../layouts/UserLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import KycRequiredRoute from './KycRequiredRoute.jsx';
import SubscriptionRequiredRoute from './SubscriptionRequiredRoute.jsx';

import DashboardOverview from '../features/dashboard/DashboardOverview.jsx';
import AccountSummary from '../features/dashboard/AccountSummary.jsx';
import PortfolioOverview from '../features/dashboard/PortfolioOverview.jsx';
import LiveTradingStatus from '../features/dashboard/LiveTradingStatus.jsx';

import LiveSignals from '../features/signal-center/LiveSignals.jsx';
import SignalHistory from '../features/signal-center/SignalHistory.jsx';
import SignalDetails from '../features/signal-center/SignalDetails.jsx';
import SignalProcessingTimeline from '../features/signal-center/SignalProcessingTimeline.jsx';
import SignalConfidence from '../features/signal-center/SignalConfidence.jsx';
import SignalRiskAnalysis from '../features/signal-center/SignalRiskAnalysis.jsx';
import ProviderSignals from '../features/signal-center/ProviderSignals.jsx';
import DuplicateSignals from '../features/signal-center/DuplicateSignals.jsx';
import ConsensusSignals from '../features/signal-center/ConsensusSignals.jsx';
import RejectedSignals from '../features/signal-center/RejectedSignals.jsx';
import SignalReplayPage from '../features/signal-center/SignalReplay.jsx';

import SignalSourcesOverview from '../features/signal-sources/SignalSourcesOverview.jsx';
import AddSignalSource from '../features/signal-sources/AddSignalSource.jsx';
import TelegramConnection from '../features/signal-sources/TelegramConnection.jsx';
import TelegramChannels from '../features/signal-sources/TelegramChannels.jsx';
import DiscordConnection from '../features/signal-sources/DiscordConnection.jsx';
import DiscordChannels from '../features/signal-sources/DiscordChannels.jsx';
import WhatsAppConnection from '../features/signal-sources/WhatsAppConnection.jsx';
import WhatsAppSources from '../features/signal-sources/WhatsAppSources.jsx';
import TradingViewWebhooks from '../features/signal-sources/TradingViewWebhooks.jsx';
import RestApiSources from '../features/signal-sources/RestApiSources.jsx';
import EmailSources from '../features/signal-sources/EmailSources.jsx';
import SourceMessageInbox from '../features/signal-sources/SourceMessageInbox.jsx';
import SourceMessageDetails from '../features/signal-sources/SourceMessageDetails.jsx';
import SourceProcessingLogs from '../features/signal-sources/SourceProcessingLogs.jsx';

import AiIntelligenceOverview from '../features/ai-intelligence/AiIntelligenceOverview.jsx';
import AiSignalParser from '../features/ai-intelligence/AiSignalParser.jsx';
import SignalInterpretation from '../features/ai-intelligence/SignalInterpretation.jsx';
import ProviderDna from '../features/ai-intelligence/ProviderDna.jsx';
import ProviderDnaRules from '../features/ai-intelligence/ProviderDnaRules.jsx';
import AiLearningActivity from '../features/ai-intelligence/AiLearningActivity.jsx';
import ConfidenceEngine from '../features/ai-intelligence/ConfidenceEngine.jsx';
import RiskIntelligence from '../features/ai-intelligence/RiskIntelligence.jsx';
import MultilingualProcessing from '../features/ai-intelligence/MultilingualProcessing.jsx';
import ConsensusEngine from '../features/ai-intelligence/ConsensusEngine.jsx';
import DuplicateDetection from '../features/ai-intelligence/DuplicateDetection.jsx';
import AiProcessingLogs from '../features/ai-intelligence/AiProcessingLogs.jsx';
import AiModelPerformance from '../features/ai-intelligence/AiModelPerformance.jsx';
import AiLearningHistory from '../features/ai-intelligence/AiLearningHistory.jsx';

import DnaOverview from '../features/provider-dna/DnaOverview.jsx';
import ProviderLanguageProfile from '../features/provider-dna/ProviderLanguageProfile.jsx';
import SymbolMapping from '../features/provider-dna/SymbolMapping.jsx';
import AbbreviationMapping from '../features/provider-dna/AbbreviationMapping.jsx';
import TradeManagementRules from '../features/provider-dna/TradeManagementRules.jsx';
import RiskBehavior from '../features/provider-dna/RiskBehavior.jsx';
import LearnedPatterns from '../features/provider-dna/LearnedPatterns.jsx';
import DnaConfidence from '../features/provider-dna/DnaConfidence.jsx';
import DnaVersionHistory from '../features/provider-dna/DnaVersionHistory.jsx';
import TrainingMessages from '../features/provider-dna/TrainingMessages.jsx';
import ProviderDnaTest from '../features/provider-dna/ProviderDnaTest.jsx';

import TradingOverview from '../features/trading/TradingOverview.jsx';
import OpenPositions from '../features/trading/OpenPositions.jsx';
import PositionDetails from '../features/trading/PositionDetails.jsx';
import TradeHistory from '../features/trading/TradeHistory.jsx';
import TradeDetails from '../features/trading/TradeDetails.jsx';
import PendingOrders from '../features/trading/PendingOrders.jsx';
import ClosedTrades from '../features/trading/ClosedTrades.jsx';
import ManualInterventions from '../features/trading/ManualInterventions.jsx';
import TradeEvents from '../features/trading/TradeEvents.jsx';
import TradeTimeline from '../features/trading/TradeTimeline.jsx';
import TradeShadow from '../features/trading/TradeShadow.jsx';
import TradeReplay from '../features/trading/TradeReplay.jsx';
import ExecutionHistory from '../features/trading/ExecutionHistory.jsx';

import RiskManagementOverview from '../features/risk-automation/RiskManagementOverview.jsx';
import RiskProfile from '../features/risk-automation/RiskProfile.jsx';
import RiskRules from '../features/risk-automation/RiskRules.jsx';
import DailyLossLimits from '../features/risk-automation/DailyLossLimits.jsx';
import DrawdownProtection from '../features/risk-automation/DrawdownProtection.jsx';
import MaximumOpenTrades from '../features/risk-automation/MaximumOpenTrades.jsx';
import TradingSessions from '../features/risk-automation/TradingSessions.jsx';
import TrailingStop from '../features/risk-automation/TrailingStop.jsx';
import BreakEven from '../features/risk-automation/BreakEven.jsx';
import ProfitLock from '../features/risk-automation/ProfitLock.jsx';
import PartialClose from '../features/risk-automation/PartialClose.jsx';
import CorrelationProtection from '../features/risk-automation/CorrelationProtection.jsx';
import NewsFilter from '../features/risk-automation/NewsFilter.jsx';
import EmergencyStop from '../features/risk-automation/EmergencyStop.jsx';
import AutomationRules from '../features/risk-automation/AutomationRules.jsx';
import CreateRule from '../features/risk-automation/CreateRule.jsx';
import ProviderSpecificRules from '../features/risk-automation/ProviderSpecificRules.jsx';
import RiskEvents from '../features/risk-automation/RiskEvents.jsx';

import BrokerAccounts from '../features/brokers/BrokerAccounts.jsx';
import ConnectBroker from '../features/brokers/ConnectBroker.jsx';
import Mt4Connection from '../features/brokers/Mt4Connection.jsx';
import Mt5Connection from '../features/brokers/Mt5Connection.jsx';
import AccountDetails from '../features/brokers/AccountDetails.jsx';
import ConnectionStatus from '../features/brokers/ConnectionStatus.jsx';
import AccountBalanceEquity from '../features/brokers/AccountBalanceEquity.jsx';
import AccountSynchronization from '../features/brokers/AccountSynchronization.jsx';
import ConnectionLogs from '../features/brokers/ConnectionLogs.jsx';
import DisconnectBroker from '../features/brokers/DisconnectBroker.jsx';

import AnalyticsOverview from '../features/analytics/AnalyticsOverview.jsx';
import PerformanceDashboard from '../features/analytics/PerformanceDashboard.jsx';
import EquityCurve from '../features/analytics/EquityCurve.jsx';
import ProfitAnalysis from '../features/analytics/ProfitAnalysis.jsx';
import DrawdownAnalysis from '../features/analytics/DrawdownAnalysis.jsx';
import WinRate from '../features/analytics/WinRate.jsx';
import RiskRewardAnalysis from '../features/analytics/RiskRewardAnalysis.jsx';
import SharpeRatio from '../features/analytics/SharpeRatio.jsx';
import SortinoRatio from '../features/analytics/SortinoRatio.jsx';
import BestSymbols from '../features/analytics/BestSymbols.jsx';
import WorstSymbols from '../features/analytics/WorstSymbols.jsx';
import ExecutionLatency from '../features/analytics/ExecutionLatency.jsx';
import RiskBehaviorAnalysis from '../features/analytics/RiskBehaviorAnalysis.jsx';
import TradingCalendar from '../features/analytics/TradingCalendar.jsx';
import PerformanceReports from '../features/analytics/PerformanceReports.jsx';
import ExportReports from '../features/analytics/ExportReports.jsx';

import BrowseProviders from '../features/provider-marketplace/BrowseProviders.jsx';
import ProviderSearch from '../features/provider-marketplace/ProviderSearch.jsx';
import ProviderCategories from '../features/provider-marketplace/ProviderCategories.jsx';
import ProviderProfile from '../features/provider-marketplace/ProviderProfile.jsx';
import ProviderPerformance from '../features/provider-marketplace/ProviderPerformance.jsx';
import ProviderSignals from '../features/provider-marketplace/ProviderSignals.jsx';
import ProviderReviews from '../features/provider-marketplace/ProviderReviews.jsx';
import ProviderRiskAnalysis from '../features/provider-marketplace/ProviderRiskAnalysis.jsx';
import ProviderSubscribers from '../features/provider-marketplace/ProviderSubscribers.jsx';
import ProviderSubscriptionPlans from '../features/provider-marketplace/ProviderSubscriptionPlans.jsx';
import SubscribeToProvider from '../features/provider-marketplace/SubscribeToProvider.jsx';
import MyProviders from '../features/provider-marketplace/MyProviders.jsx';
import ProviderComparison from '../features/provider-marketplace/ProviderComparison.jsx';
import ProviderConsensus from '../features/provider-marketplace/ProviderConsensus.jsx';

import BrowseTraders from '../features/trader-marketplace/BrowseTraders.jsx';
import TraderSearch from '../features/trader-marketplace/TraderSearch.jsx';
import TraderCategories from '../features/trader-marketplace/TraderCategories.jsx';
import TraderProfile from '../features/trader-marketplace/TraderProfile.jsx';
import TraderPerformance from '../features/trader-marketplace/TraderPerformance.jsx';
import TraderRisk from '../features/trader-marketplace/TraderRisk.jsx';
import TraderBehavior from '../features/trader-marketplace/TraderBehavior.jsx';
import TraderIntelligence from '../features/trader-marketplace/TraderIntelligence.jsx';
import TraderReviews from '../features/trader-marketplace/TraderReviews.jsx';
import TradingStyle from '../features/trader-marketplace/TradingStyle.jsx';
import FollowTrader from '../features/trader-marketplace/FollowTrader.jsx';
import CopyTradingSettings from '../features/trader-marketplace/CopyTradingSettings.jsx';
import MyFollowedTraders from '../features/trader-marketplace/MyFollowedTraders.jsx';

import IntelligenceOverview from '../features/trader-intelligence/IntelligenceOverview.jsx';
import ConsistencyDiscipline from '../features/trader-intelligence/ConsistencyDiscipline.jsx';
import AverageRiskReward from '../features/trader-intelligence/AverageRiskReward.jsx';
import HoldingTime from '../features/trader-intelligence/HoldingTime.jsx';
import RiskBehavior from '../features/trader-intelligence/RiskBehavior.jsx';
import MartingaleGridDetection from '../features/trader-intelligence/MartingaleGridDetection.jsx';
import NewsExposure from '../features/trader-intelligence/NewsExposure.jsx';
import RecoveryTrading from '../features/trader-intelligence/RecoveryTrading.jsx';
import TradingStyleClassification from '../features/trader-intelligence/TradingStyleClassification.jsx';
import BehaviorTimeline from '../features/trader-intelligence/BehaviorTimeline.jsx';

import ReferralDashboard from '../features/referrals/ReferralDashboard.jsx';
import ReferralLinkCode from '../features/referrals/ReferralLinkCode.jsx';
import InviteFriends from '../features/referrals/InviteFriends.jsx';
import ReferralNetwork from '../features/referrals/ReferralNetwork.jsx';
import ReferredUsers from '../features/referrals/ReferredUsers.jsx';
import ReferralPerformance from '../features/referrals/ReferralPerformance.jsx';
import ReferralEarnings from '../features/referrals/ReferralEarnings.jsx';
import PendingRewards from '../features/referrals/PendingRewards.jsx';
import AvailableRewards from '../features/referrals/AvailableRewards.jsx';
import ReferralWallet from '../features/referrals/ReferralWallet.jsx';
import RewardHistory from '../features/referrals/RewardHistory.jsx';
import MonthlySettlement from '../features/referrals/MonthlySettlement.jsx';
import ReferralLeaderboard from '../features/referrals/ReferralLeaderboard.jsx';
import ReferralTerms from '../features/referrals/ReferralTerms.jsx';

import PricingPlans from '../features/subscriptions/PricingPlans.jsx';
import SubscriptionCheckout from '../features/subscriptions/SubscriptionCheckout.jsx';
import MySubscription from '../features/subscriptions/MySubscription.jsx';
import UpgradePlan from '../features/subscriptions/UpgradePlan.jsx';
import DowngradePlan from '../features/subscriptions/DowngradePlan.jsx';
import BillingHistory from '../features/subscriptions/BillingHistory.jsx';
import InvoiceDetails from '../features/subscriptions/InvoiceDetails.jsx';
import PaymentMethods from '../features/subscriptions/PaymentMethods.jsx';
import SubscriptionUsage from '../features/subscriptions/SubscriptionUsage.jsx';
import CancelSubscription from '../features/subscriptions/CancelSubscription.jsx';

import WalletOverview from '../features/wallet/WalletOverview.jsx';
import AvailableBalance from '../features/wallet/AvailableBalance.jsx';
import PendingBalance from '../features/wallet/PendingBalance.jsx';
import TransactionHistory from '../features/wallet/TransactionHistory.jsx';
import WithdrawalRequest from '../features/wallet/WithdrawalRequest.jsx';
import WithdrawalStatus from '../features/wallet/WithdrawalStatus.jsx';
import WithdrawalHistory from '../features/wallet/WithdrawalHistory.jsx';
import PaymentAccounts from '../features/wallet/PaymentAccounts.jsx';

import NotificationCenter from '../features/notifications/NotificationCenter.jsx';
import TradeNotifications from '../features/notifications/TradeNotifications.jsx';
import SignalNotifications from '../features/notifications/SignalNotifications.jsx';
import KycNotifications from '../features/notifications/KycNotifications.jsx';
import ReferralNotifications from '../features/notifications/ReferralNotifications.jsx';
import PaymentNotifications from '../features/notifications/PaymentNotifications.jsx';
import SecurityNotifications from '../features/notifications/SecurityNotifications.jsx';
import SystemNotifications from '../features/notifications/SystemNotifications.jsx';
import NotificationPreferences from '../features/notifications/NotificationPreferences.jsx';

import ProfileSettings from '../features/settings/ProfileSettings.jsx';
import AccountSettings from '../features/settings/AccountSettings.jsx';
import SecuritySettings from '../features/settings/SecuritySettings.jsx';
import TwoFactorSettings from '../features/settings/TwoFactorSettings.jsx';
import ConnectedDevices from '../features/settings/ConnectedDevices.jsx';
import ConnectedAccounts from '../features/settings/ConnectedAccounts.jsx';
import BrokerSettings from '../features/settings/BrokerSettings.jsx';
import SignalSourceSettings from '../features/settings/SignalSourceSettings.jsx';
import TradingPreferences from '../features/settings/TradingPreferences.jsx';
import RiskPreferences from '../features/settings/RiskPreferences.jsx';
import NotificationSettings from '../features/settings/NotificationSettings.jsx';
import PrivacySettings from '../features/settings/PrivacySettings.jsx';
import ApiKeys from '../features/settings/ApiKeys.jsx';
import DataPrivacy from '../features/settings/DataPrivacy.jsx';
import DeleteAccount from '../features/settings/DeleteAccount.jsx';

import KycIntro from '../features/kyc/KycIntro.jsx';
import KycPersonalInfo from '../features/kyc/KycPersonalInfo.jsx';
import KycDocumentSelection from '../features/kyc/KycDocumentSelection.jsx';
import KycDocumentUpload from '../features/kyc/KycDocumentUpload.jsx';
import KycDocumentVerification from '../features/kyc/KycDocumentVerification.jsx';
import KycSelfieVerification from '../features/kyc/KycSelfieVerification.jsx';
import KycReviewStatus from '../features/kyc/KycReviewStatus.jsx';
import KycResult from '../features/kyc/KycResult.jsx';
import KycResubmission from '../features/kyc/KycResubmission.jsx';
import KycExpired from '../features/kyc/KycExpired.jsx';
import KycHelp from '../features/kyc/KycHelp.jsx';
import KycStatusDashboard from '../features/kyc/KycStatusDashboard.jsx';

import ReplayCenter from '../features/replay/ReplayCenter.jsx';
import AiProcessingReplay from '../features/replay/AiProcessingReplay.jsx';
import RiskDecisionReplay from '../features/replay/RiskDecisionReplay.jsx';
import ExecutionReplay from '../features/replay/ExecutionReplay.jsx';
import ProviderMessageReplay from '../features/replay/ProviderMessageReplay.jsx';
import SystemEventTimeline from '../features/replay/SystemEventTimeline.jsx';

import SolanaWalletConnect from '../features/solana/SolanaWalletConnect.jsx';
import SolanaWalletSettings from '../features/solana/SolanaWalletSettings.jsx';
import SolanaReputation from '../features/solana/SolanaReputation.jsx';
import SolanaProvenanceExplorer from '../features/solana/SolanaProvenanceExplorer.jsx';
import SolanaAttestationViewer from '../features/solana/SolanaAttestationViewer.jsx';
import SolanaPaymentCheckout from '../features/solana/SolanaPaymentCheckout.jsx';
import SolanaPaymentHistory from '../features/solana/SolanaPaymentHistory.jsx';
import PublicVerification from '../features/solana/PublicVerification.jsx';
import OnChainBadgesShowcase from '../features/solana/OnChainBadgesShowcase.jsx';

import HelpCenter from '../features/support/HelpCenter.jsx';
import SupportDashboard from '../features/support/SupportDashboard.jsx';
import CreateTicket from '../features/support/CreateTicket.jsx';
import TicketDetails from '../features/support/TicketDetails.jsx';
import MyTickets from '../features/support/MyTickets.jsx';
import KnowledgeBase from '../features/support/KnowledgeBase.jsx';
import TradingFaq from '../features/support/TradingFaq.jsx';
import KycFaq from '../features/support/KycFaq.jsx';
import BillingFaq from '../features/support/BillingFaq.jsx';
import TechnicalSupport from '../features/support/TechnicalSupport.jsx';

export default function UserRoutes() {
  return (
    <>
      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/account-summary" element={<AccountSummary />} />
          <Route path="/dashboard/portfolio" element={<PortfolioOverview />} />
          <Route path="/dashboard/live-trading" element={<LiveTradingStatus />} />

          {/* Signal Center */}
          <Route path="/signals" element={<LiveSignals />} />
          <Route path="/signals/live" element={<LiveSignals />} />
          <Route path="/signals/history" element={<SignalHistory />} />
          <Route path="/signals/providers" element={<ProviderSignals />} />
          <Route path="/signals/duplicates" element={<DuplicateSignals />} />
          <Route path="/signals/consensus" element={<ConsensusSignals />} />
          <Route path="/signals/rejected" element={<RejectedSignals />} />
          <Route path="/signals/:signalId" element={<SignalDetails />} />
          <Route path="/signals/:signalId/timeline" element={<SignalProcessingTimeline />} />
          <Route path="/signals/:signalId/confidence" element={<SignalConfidence />} />
          <Route path="/signals/:signalId/risk" element={<SignalRiskAnalysis />} />
          <Route path="/signals/:signalId/replay" element={<SignalReplayPage />} />

          {/* Signal Sources */}
          <Route path="/signal-sources" element={<SignalSourcesOverview />} />
          <Route path="/signal-sources/add" element={<AddSignalSource />} />
          <Route path="/signal-sources/telegram" element={<TelegramConnection />} />
          <Route path="/signal-sources/telegram/channels" element={<TelegramChannels />} />
          <Route path="/signal-sources/discord" element={<DiscordConnection />} />
          <Route path="/signal-sources/discord/channels" element={<DiscordChannels />} />
          <Route path="/signal-sources/whatsapp" element={<WhatsAppConnection />} />
          <Route path="/signal-sources/whatsapp/sources" element={<WhatsAppSources />} />
          <Route path="/signal-sources/tradingview" element={<TradingViewWebhooks />} />
          <Route path="/signal-sources/rest-api" element={<RestApiSources />} />
          <Route path="/signal-sources/email" element={<EmailSources />} />
          <Route path="/signal-sources/messages" element={<SourceMessageInbox />} />
          <Route path="/signal-sources/messages/:messageId" element={<SourceMessageDetails />} />
          <Route path="/signal-sources/logs" element={<SourceProcessingLogs />} />

          {/* AI Intelligence */}
          <Route path="/ai-intelligence" element={<AiIntelligenceOverview />} />
          <Route path="/ai-intelligence/parser" element={<AiSignalParser />} />
          <Route path="/ai-intelligence/interpretation" element={<SignalInterpretation />} />
          <Route path="/ai-intelligence/provider-dna" element={<ProviderDna />} />
          <Route path="/ai-intelligence/provider-dna/rules" element={<ProviderDnaRules />} />
          <Route path="/ai-intelligence/learning" element={<AiLearningActivity />} />
          <Route path="/ai-intelligence/confidence" element={<ConfidenceEngine />} />
          <Route path="/ai-intelligence/risk" element={<RiskIntelligence />} />
          <Route path="/ai-intelligence/multilingual" element={<MultilingualProcessing />} />
          <Route path="/ai-intelligence/consensus" element={<ConsensusEngine />} />
          <Route path="/ai-intelligence/duplicates" element={<DuplicateDetection />} />
          <Route path="/ai-intelligence/logs" element={<AiProcessingLogs />} />
          <Route path="/ai-intelligence/models" element={<AiModelPerformance />} />
          <Route path="/ai-intelligence/history" element={<AiLearningHistory />} />

          {/* Provider DNA */}
          <Route path="/provider-dna" element={<DnaOverview />} />
          <Route path="/provider-dna/overview" element={<DnaOverview />} />
          <Route path="/provider-dna/language" element={<ProviderLanguageProfile />} />
          <Route path="/provider-dna/symbols" element={<SymbolMapping />} />
          <Route path="/provider-dna/abbreviations" element={<AbbreviationMapping />} />
          <Route path="/provider-dna/management-rules" element={<TradeManagementRules />} />
          <Route path="/provider-dna/risk-behavior" element={<RiskBehavior />} />
          <Route path="/provider-dna/patterns" element={<LearnedPatterns />} />
          <Route path="/provider-dna/confidence" element={<DnaConfidence />} />
          <Route path="/provider-dna/versions" element={<DnaVersionHistory />} />
          <Route path="/provider-dna/training" element={<TrainingMessages />} />
          <Route path="/provider-dna/test" element={<ProviderDnaTest />} />

          {/* Trading */}
          <Route path="/trading" element={<TradingOverview />} />
          <Route path="/trading/positions" element={<OpenPositions />} />
          <Route path="/trading/positions/:positionId" element={<PositionDetails />} />
          <Route path="/trading/history" element={<TradeHistory />} />
          <Route path="/trading/pending-orders" element={<PendingOrders />} />
          <Route path="/trading/closed" element={<ClosedTrades />} />
          <Route path="/trading/manual-interventions" element={<ManualInterventions />} />
          <Route path="/trading/events" element={<TradeEvents />} />
          <Route path="/trading/shadow" element={<TradeShadow />} />
          <Route path="/trading/execution-history" element={<ExecutionHistory />} />
          <Route path="/trading/:tradeId" element={<TradeDetails />} />
          <Route path="/trading/:tradeId/timeline" element={<TradeTimeline />} />
          <Route path="/trading/:tradeId/replay" element={<TradeReplay />} />

          {/* Risk & Automation */}
          <Route path="/risk" element={<RiskManagementOverview />} />
          <Route path="/risk/profile" element={<RiskProfile />} />
          <Route path="/risk/rules" element={<RiskRules />} />
          <Route path="/risk/daily-loss-limits" element={<DailyLossLimits />} />
          <Route path="/risk/drawdown-protection" element={<DrawdownProtection />} />
          <Route path="/risk/max-open-trades" element={<MaximumOpenTrades />} />
          <Route path="/risk/trading-sessions" element={<TradingSessions />} />
          <Route path="/risk/trailing-stop" element={<TrailingStop />} />
          <Route path="/risk/break-even" element={<BreakEven />} />
          <Route path="/risk/profit-lock" element={<ProfitLock />} />
          <Route path="/risk/partial-close" element={<PartialClose />} />
          <Route path="/risk/correlation-protection" element={<CorrelationProtection />} />
          <Route path="/risk/news-filter" element={<NewsFilter />} />
          <Route path="/risk/emergency-stop" element={<EmergencyStop />} />
          <Route path="/risk/events" element={<RiskEvents />} />
          <Route path="/automation/rules" element={<AutomationRules />} />
          <Route path="/automation/rules/create" element={<CreateRule />} />
          <Route path="/automation/rules/provider" element={<ProviderSpecificRules />} />

          {/* Brokers */}
          <Route path="/brokers" element={<BrokerAccounts />} />
          <Route path="/brokers/connect" element={<ConnectBroker />} />
          <Route path="/brokers/mt4" element={<Mt4Connection />} />
          <Route path="/brokers/mt5" element={<Mt5Connection />} />
          <Route path="/brokers/status" element={<ConnectionStatus />} />
          <Route path="/brokers/balance" element={<AccountBalanceEquity />} />
          <Route path="/brokers/sync" element={<AccountSynchronization />} />
          <Route path="/brokers/logs" element={<ConnectionLogs />} />
          <Route path="/brokers/disconnect" element={<DisconnectBroker />} />
          <Route path="/brokers/:accountId" element={<AccountDetails />} />

          {/* Analytics */}
          <Route path="/analytics" element={<AnalyticsOverview />} />
          <Route path="/analytics/performance" element={<PerformanceDashboard />} />
          <Route path="/analytics/equity-curve" element={<EquityCurve />} />
          <Route path="/analytics/profit" element={<ProfitAnalysis />} />
          <Route path="/analytics/drawdown" element={<DrawdownAnalysis />} />
          <Route path="/analytics/win-rate" element={<WinRate />} />
          <Route path="/analytics/risk-reward" element={<RiskRewardAnalysis />} />
          <Route path="/analytics/sharpe" element={<SharpeRatio />} />
          <Route path="/analytics/sortino" element={<SortinoRatio />} />
          <Route path="/analytics/best-symbols" element={<BestSymbols />} />
          <Route path="/analytics/worst-symbols" element={<WorstSymbols />} />
          <Route path="/analytics/execution-latency" element={<ExecutionLatency />} />
          <Route path="/analytics/risk-behavior" element={<RiskBehaviorAnalysis />} />
          <Route path="/analytics/calendar" element={<TradingCalendar />} />
          <Route path="/analytics/reports" element={<PerformanceReports />} />
          <Route path="/analytics/export" element={<ExportReports />} />

          {/* Provider Marketplace */}
          <Route path="/marketplace/providers" element={<BrowseProviders />} />
          <Route path="/marketplace/providers/search" element={<ProviderSearch />} />
          <Route path="/marketplace/providers/categories" element={<ProviderCategories />} />
          <Route path="/marketplace/providers/my" element={<MyProviders />} />
          <Route path="/marketplace/providers/compare" element={<ProviderComparison />} />
          <Route path="/marketplace/providers/consensus" element={<ProviderConsensus />} />
          <Route path="/marketplace/providers/:providerId" element={<ProviderProfile />} />
          <Route path="/marketplace/providers/:providerId/performance" element={<ProviderPerformance />} />
          <Route path="/marketplace/providers/:providerId/signals" element={<ProviderSignals />} />
          <Route path="/marketplace/providers/:providerId/reviews" element={<ProviderReviews />} />
          <Route path="/marketplace/providers/:providerId/risk" element={<ProviderRiskAnalysis />} />
          <Route path="/marketplace/providers/:providerId/subscribers" element={<ProviderSubscribers />} />
          <Route path="/marketplace/providers/:providerId/plans" element={<ProviderSubscriptionPlans />} />
          <Route path="/marketplace/providers/:providerId/subscribe" element={<SubscribeToProvider />} />

          {/* Trader Marketplace */}
          <Route path="/marketplace/traders" element={<BrowseTraders />} />
          <Route path="/marketplace/traders/search" element={<TraderSearch />} />
          <Route path="/marketplace/traders/categories" element={<TraderCategories />} />
          <Route path="/marketplace/traders/my" element={<MyFollowedTraders />} />
          <Route path="/marketplace/traders/copy-settings" element={<CopyTradingSettings />} />
          <Route path="/marketplace/traders/:traderId" element={<TraderProfile />} />
          <Route path="/marketplace/traders/:traderId/performance" element={<TraderPerformance />} />
          <Route path="/marketplace/traders/:traderId/risk" element={<TraderRisk />} />
          <Route path="/marketplace/traders/:traderId/behavior" element={<TraderBehavior />} />
          <Route path="/marketplace/traders/:traderId/intelligence" element={<TraderIntelligence />} />
          <Route path="/marketplace/traders/:traderId/reviews" element={<TraderReviews />} />
          <Route path="/marketplace/traders/:traderId/style" element={<TradingStyle />} />
          <Route path="/marketplace/traders/:traderId/follow" element={<FollowTrader />} />

          {/* Trader Intelligence */}
          <Route path="/trader-intelligence" element={<IntelligenceOverview />} />
          <Route path="/trader-intelligence/consistency" element={<ConsistencyDiscipline />} />
          <Route path="/trader-intelligence/average-risk-reward" element={<AverageRiskReward />} />
          <Route path="/trader-intelligence/holding-time" element={<HoldingTime />} />
          <Route path="/trader-intelligence/risk-behavior" element={<RiskBehavior />} />
          <Route path="/trader-intelligence/martingale-grid" element={<MartingaleGridDetection />} />
          <Route path="/trader-intelligence/news-exposure" element={<NewsExposure />} />
          <Route path="/trader-intelligence/recovery-trading" element={<RecoveryTrading />} />
          <Route path="/trader-intelligence/style" element={<TradingStyleClassification />} />
          <Route path="/trader-intelligence/timeline" element={<BehaviorTimeline />} />

          {/* Referrals */}
          <Route element={<KycRequiredRoute />}>
            <Route path="/referrals" element={<ReferralDashboard />} />
            <Route path="/referrals/link" element={<ReferralLinkCode />} />
            <Route path="/referrals/invite" element={<InviteFriends />} />
            <Route path="/referrals/network" element={<ReferralNetwork />} />
            <Route path="/referrals/users" element={<ReferredUsers />} />
            <Route path="/referrals/performance" element={<ReferralPerformance />} />
            <Route path="/referrals/earnings" element={<ReferralEarnings />} />
            <Route path="/referrals/rewards/pending" element={<PendingRewards />} />
            <Route path="/referrals/rewards/available" element={<AvailableRewards />} />
            <Route path="/referrals/wallet" element={<ReferralWallet />} />
            <Route path="/referrals/rewards/history" element={<RewardHistory />} />
            <Route path="/referrals/settlement" element={<MonthlySettlement />} />
            <Route path="/referrals/leaderboard" element={<ReferralLeaderboard />} />
            <Route path="/referrals/terms" element={<ReferralTerms />} />
          </Route>

          {/* Subscriptions */}
          <Route element={<KycRequiredRoute />}>
            <Route path="/subscriptions/plans" element={<PricingPlans />} />
            <Route path="/subscriptions/checkout" element={<SubscriptionCheckout />} />
            <Route path="/subscriptions/my" element={<MySubscription />} />
            <Route path="/subscriptions/upgrade" element={<UpgradePlan />} />
            <Route path="/subscriptions/downgrade" element={<DowngradePlan />} />
            <Route path="/subscriptions/billing" element={<BillingHistory />} />
            <Route path="/subscriptions/invoices/:invoiceId" element={<InvoiceDetails />} />
            <Route path="/subscriptions/payment-methods" element={<PaymentMethods />} />
            <Route path="/subscriptions/usage" element={<SubscriptionUsage />} />
            <Route path="/subscriptions/cancel" element={<CancelSubscription />} />
          </Route>

          {/* Wallet & Withdrawals */}
          <Route path="/wallet" element={<WalletOverview />} />
          <Route path="/wallet/available" element={<AvailableBalance />} />
          <Route path="/wallet/pending" element={<PendingBalance />} />
          <Route path="/wallet/transactions" element={<TransactionHistory />} />
          <Route path="/wallet/payment-accounts" element={<PaymentAccounts />} />
          <Route element={<KycRequiredRoute />}>
            <Route path="/wallet/withdraw" element={<WithdrawalRequest />} />
            <Route path="/wallet/withdrawals/status" element={<WithdrawalStatus />} />
            <Route path="/wallet/withdrawals/history" element={<WithdrawalHistory />} />
          </Route>

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/notifications/trades" element={<TradeNotifications />} />
          <Route path="/notifications/signals" element={<SignalNotifications />} />
          <Route path="/notifications/kyc" element={<KycNotifications />} />
          <Route path="/notifications/referrals" element={<ReferralNotifications />} />
          <Route path="/notifications/payments" element={<PaymentNotifications />} />
          <Route path="/notifications/security" element={<SecurityNotifications />} />
          <Route path="/notifications/system" element={<SystemNotifications />} />
          <Route path="/notifications/preferences" element={<NotificationPreferences />} />

          {/* Settings */}
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/security" element={<SecuritySettings />} />
          <Route path="/settings/2fa" element={<TwoFactorSettings />} />
          <Route path="/settings/devices" element={<ConnectedDevices />} />
          <Route path="/settings/accounts" element={<ConnectedAccounts />} />
          <Route path="/settings/brokers" element={<BrokerSettings />} />
          <Route path="/settings/signal-sources" element={<SignalSourceSettings />} />
          <Route path="/settings/trading" element={<TradingPreferences />} />
          <Route path="/settings/risk" element={<RiskPreferences />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/settings/privacy" element={<PrivacySettings />} />
          <Route path="/settings/api-keys" element={<ApiKeys />} />
          <Route path="/settings/data-privacy" element={<DataPrivacy />} />
          <Route path="/settings/delete-account" element={<DeleteAccount />} />

          {/* KYC */}
          <Route path="/kyc" element={<KycIntro />} />
          <Route path="/kyc/personal-info" element={<KycPersonalInfo />} />
          <Route path="/kyc/document-selection" element={<KycDocumentSelection />} />
          <Route path="/kyc/document-upload" element={<KycDocumentUpload />} />
          <Route path="/kyc/document-verification" element={<KycDocumentVerification />} />
          <Route path="/kyc/selfie-verification" element={<KycSelfieVerification />} />
          <Route path="/kyc/review-status" element={<KycReviewStatus />} />
          <Route path="/kyc/result" element={<KycResult />} />
          <Route path="/kyc/resubmission" element={<KycResubmission />} />
          <Route path="/kyc/expired" element={<KycExpired />} />
          <Route path="/kyc/help" element={<KycHelp />} />
          <Route path="/kyc/status" element={<KycStatusDashboard />} />

          {/* Replay */}
          <Route path="/replay" element={<ReplayCenter />} />
          <Route path="/replay/signals/:signalId" element={<SignalReplayPage />} />
          <Route path="/replay/trades/:tradeId" element={<TradeReplay />} />
          <Route path="/replay/ai/:signalId" element={<AiProcessingReplay />} />
          <Route path="/replay/risk/:signalId" element={<RiskDecisionReplay />} />
          <Route path="/replay/execution/:tradeId" element={<ExecutionReplay />} />
          <Route path="/replay/providers/:messageId" element={<ProviderMessageReplay />} />
          <Route path="/replay/system/:correlationId" element={<SystemEventTimeline />} />

          {/* Solana */}
          <Route path="/solana/wallet/connect" element={<SolanaWalletConnect />} />
          <Route path="/solana/wallet/settings" element={<SolanaWalletSettings />} />
          <Route path="/solana/reputation" element={<SolanaReputation />} />
          <Route path="/solana/provenance" element={<SolanaProvenanceExplorer />} />
          <Route path="/solana/attestations" element={<SolanaAttestationViewer />} />
          <Route path="/solana/payments/checkout" element={<SolanaPaymentCheckout />} />
          <Route path="/solana/payments/history" element={<SolanaPaymentHistory />} />
          <Route path="/solana/badges" element={<OnChainBadgesShowcase />} />

          {/* Support */}
          <Route path="/support" element={<HelpCenter />} />
          <Route path="/support/dashboard" element={<SupportDashboard />} />
          <Route path="/support/tickets" element={<MyTickets />} />
          <Route path="/support/tickets/create" element={<CreateTicket />} />
          <Route path="/support/tickets/:ticketId" element={<TicketDetails />} />
          <Route path="/support/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/support/faq/trading" element={<TradingFaq />} />
          <Route path="/support/faq/kyc" element={<KycFaq />} />
          <Route path="/support/faq/billing" element={<BillingFaq />} />
          <Route path="/support/technical" element={<TechnicalSupport />} />
        </Route>
      </Route>

      {/* Public verification route (no auth required) */}
      <Route path="/verify/:hash" element={<PublicVerification />} />
    </>
  );
}