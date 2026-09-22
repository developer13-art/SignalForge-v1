/**
 * Trade Type Definitions
 *
 * Provides JSDoc typedefs for trade-related objects used in the
 * SignalForge trading pipeline.
 *
 * @module @signalforge/shared/types/trade
 */

/**
 * @typedef {Object} Trade
 * @property {string} tradeId
 * @property {string} userId
 * @property {string} brokerAccountId
 * @property {string|null} signalId
 * @property {string|null} providerId
 * @property {string|null} parentTradeId
 * @property {string} symbol
 * @property {string} direction
 * @property {string} entryType
 * @property {number|null} requestedPrice
 * @property {number|null} entryPrice
 * @property {number|null} exitPrice
 * @property {number} volume
 * @property {number|null} remainingVolume
 * @property {number|null} stopLoss
 * @property {number|null} takeProfit
 * @property {Array<number>} takeProfits
 * @property {number|null} magicNumber
 * @property {string|null} brokerOrderId
 * @property {string|null} brokerPositionId
 * @property {string|null} brokerTicket
 * @property {string} platform
 * @property {string} accountType
 * @property {string} status
 * @property {number|null} realizedProfit
 * @property {number|null} unrealizedProfit
 * @property {number|null} commission
 * @property {number|null} swap
 * @property {string|null} openedAt
 * @property {string|null} closedAt
 * @property {string|null} openedBy
 * @property {string|null} closedBy
 * @property {string|null} rejectionReason
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} TradeEvent
 * @property {string} eventId
 * @property {string} tradeId
 * @property {string} eventType
 * @property {string} actor
 * @property {string|null} actorId
 * @property {string|null} previousState
 * @property {string|null} newState
 * @property {Object|null} payload
 * @property {string} timestamp
 */

/**
 * @typedef {Object} TradeShadow
 * @property {string} shadowId
 * @property {string} providerTradeId
 * @property {string} userTradeId
 * @property {string} userId
 * @property {number|null} providerRealizedProfit
 * @property {number|null} userRealizedProfit
 * @property {number|null} missedProfit
 * @property {number|null} difference
 * @property {string} outcome
 * @property {string|null} reason
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ExecutionRequest
 * @property {string} executionRequestId
 * @property {string} tradeId
 * @property {string|null} signalId
 * @property {string} userId
 * @property {string} brokerAccountId
 * @property {string|null} metaApiAccountId
 * @property {string|null} platform
 * @property {string} symbol
 * @property {string} direction
 * @property {string} entryType
 * @property {number} volume
 * @property {number|null} price
 * @property {number|null} stopLoss
 * @property {number|null} takeProfit
 * @property {string|null} comment
 * @property {number|null} magicNumber
 * @property {number|null} slippage
 * @property {string} requestedAt
 * @property {number} attempt
 * @property {number} maxAttempts
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} ExecutionResult
 * @property {string} executionRequestId
 * @property {string} tradeId
 * @property {boolean} success
 * @property {string|null} brokerOrderId
 * @property {string|null} brokerPositionId
 * @property {string|null} brokerTicket
 * @property {number|null} executedPrice
 * @property {number|null} executedVolume
 * @property {string|null} rejectionReason
 * @property {Object|null} brokerResponse
 * @property {number} durationMs
 * @property {string} timestamp
 */

/**
 * @typedef {Object} OpenPosition
 * @property {string} tradeId
 * @property {string} symbol
 * @property {string} direction
 * @property {number} volume
 * @property {number} entryPrice
 * @property {number} currentPrice
 * @property {number|null} stopLoss
 * @property {number|null} takeProfit
 * @property {number} unrealizedProfit
 * @property {string} openedAt
 */

/**
 * @typedef {Object} ClosedTrade
 * @property {string} tradeId
 * @property {string} symbol
 * @property {string} direction
 * @property {number} volume
 * @property {number} entryPrice
 * @property {number} exitPrice
 * @property {number} realizedProfit
 * @property {number} commission
 * @property {number} swap
 * @property {string} openedAt
 * @property {string} closedAt
 * @property {string} closedBy
 */

/**
 * @typedef {Object} TradeActor
 * @property {'SYSTEM'|'USER'|'PROVIDER'|'AUTO_RULE'|'BROKER'|'ADMIN'|'RISK_ENGINE'|'COPY_ENGINE'} type
 * @property {string|null} id
 * @property {string|null} label
 */

export const TRADE_TYPES = Object.freeze({
  Trade: 'Trade',
  TradeEvent: 'TradeEvent',
  TradeShadow: 'TradeShadow',
  ExecutionRequest: 'ExecutionRequest',
  ExecutionResult: 'ExecutionResult',
  OpenPosition: 'OpenPosition',
  ClosedTrade: 'ClosedTrade',
  TradeActor: 'TradeActor',
});