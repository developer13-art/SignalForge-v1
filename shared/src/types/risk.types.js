/**
 * Risk Type Definitions
 *
 * Provides JSDoc typedefs for risk-related objects used by the
 * SignalForge Risk Engine and automation layer.
 *
 * @module @signalforge/shared/types/risk
 */

/**
 * @typedef {Object} RiskProfile
 * @property {string} riskProfileId
 * @property {string} userId
 * @property {string|null} brokerAccountId
 * @property {number} riskPercent
 * @property {number} maxDailyLoss
 * @property {number} maxDrawdown
 * @property {number} maxOpenTrades
 * @property {Array<string>} tradingSessions
 * @property {boolean} trailingStopEnabled
 * @property {number|null} trailingStopPips
 * @property {boolean} breakEvenEnabled
 * @property {number|null} breakEvenPips
 * @property {boolean} profitLockEnabled
 * @property {number|null} profitLockPips
 * @property {boolean} partialCloseEnabled
 * @property {number|null} partialClosePercent
 * @property {boolean} correlationProtection
 * @property {boolean} newsFilterEnabled
 * @property {number|null} newsFilterMinutes
 * @property {boolean} emergencyStopEnabled
 * @property {number|null} maxLotSize
 * @property {number|null} maxSpreadPips
 * @property {number|null} maxSlippagePips
 * @property {Array<string>} allowedSymbols
 * @property {Array<string>} blockedSymbols
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} RiskCheck
 * @property {string} name
 * @property {boolean} passed
 * @property {string|null} reason
 * @property {Object|null} details
 */

/**
 * @typedef {Object} RiskDecision
 * @property {string} decisionId
 * @property {string} signalId
 * @property {string} userId
 * @property {string|null} brokerAccountId
 * @property {'APPROVED'|'REJECTED'|'REQUIRES_MANUAL_REVIEW'} decision
 * @property {number|null} approvedVolume
 * @property {number|null} approvedRiskPercent
 * @property {Array<RiskCheck>} checks
 * @property {Array<string>} failedChecks
 * @property {string|null} reason
 * @property {number|null} durationMs
 * @property {string} timestamp
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} RiskEvent
 * @property {string} eventId
 * @property {string} userId
 * @property {string|null} brokerAccountId
 * @property {string} eventType
 * @property {string} severity
 * @property {string} message
 * @property {Object|null} details
 * @property {string} timestamp
 */

/**
 * @typedef {Object} AutomationRule
 * @property {string} ruleId
 * @property {string} userId
 * @property {string} name
 * @property {string|null} description
 * @property {string} scope
 * @property {string|null} providerId
 * @property {string|null} symbol
 * @property {Object} condition
 * @property {Object} action
 * @property {number} priority
 * @property {boolean} enabled
 * @property {boolean} stopOnMatch
 * @property {string|null} createdAt
 * @property {string|null} updatedAt
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} AutomationTrigger
 * @property {string} triggerId
 * @property {string} ruleId
 * @property {string} tradeId
 * @property {string} userId
 * @property {Object} conditionMatched
 * @property {Object} actionExecuted
 * @property {boolean} success
 * @property {string|null} error
 * @property {string} timestamp
 */

export const RISK_TYPES = Object.freeze({
  RiskProfile: 'RiskProfile',
  RiskCheck: 'RiskCheck',
  RiskDecision: 'RiskDecision',
  RiskEvent: 'RiskEvent',
  AutomationRule: 'AutomationRule',
  AutomationTrigger: 'AutomationTrigger',
});