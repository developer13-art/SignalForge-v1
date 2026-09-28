/**
 * Lifecycle Service
 *
 * @module signalforge/server/modules/trade-state/lifecycle/service
 */
const { StateTransitions } = require('./state-transitions.js');
const { TransitionValidatorService } = require('./transition-validator.service.js');
const { ActorAttributionService } = require('./actor-attribution.service.js');
const { TradeStateRepository } = require('../trade-state.repository.js');
const { TradeEventService } = require('../events/trade-event.service.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { InvalidTradeStateError, TradeNotFoundError } = require('../trade-state.errors.js');
const { isValidTradeState } = require('../trade-state.constants.js');
const { emitLifecycleStarted, emitLifecycleCompleted } = require('../trade-state.events.js');

export class LifecycleService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradeStateRepository();
    this.transitions = dependencies.transitions || new StateTransitions();
    this.validator =
      dependencies.validator || new TransitionValidatorService(this.transitions);
    this.actorAttribution =
      dependencies.actorAttribution || new ActorAttributionService();
    this.events =
      dependencies.events || new TradeEventService({ repository: this.repository });
    this.logger = getLogger('trade-lifecycle');
  }

  async startLifecycle(tradeId, initialState = 'SIGNAL_RECEIVED', meta = {}) {
    if (!isValidTradeState(initialState)) {
      throw new InvalidTradeStateError(undefined, { state: initialState });
    }
    await emitLifecycleStarted(tradeId, meta);
    return { started: true, initialState };
  }

  async completeLifecycle(tradeId, meta = {}) {
    await emitLifecycleCompleted(tradeId, meta);
    return { completed: true };
  }

  async transition(tradeId, eventType, options = {}) {
    const trade = await this.repository.findById(tradeId);
    if (!trade) {
      throw new TradeNotFoundError(undefined, { tradeId });
    }

    const fromState = trade.status;
    const actor = this.actorAttribution.deriveActor(eventType, options.actor);

    const validation = this.validator.validateEventTransition(fromState, eventType);

    const targetState = options.newState || validation.targetState;

    if (fromState && targetState && fromState !== targetState) {
      this.transitions.validateTransition(fromState, targetState);
    }

    const event = await this.events.recordEvent({
      tradeId: trade.id,
      userId: trade.user_id,
      eventType,
      actor,
      actorId: options.actorId || null,
      previousState: fromState,
      newState: targetState || fromState,
      payload: options.payload || null,
      metadata: options.metadata || null,
    });

    if (targetState && targetState !== fromState) {
      await this.repository.update(trade.id, { status: targetState });
    }

    return {
      tradeId: trade.id,
      previousState: fromState,
      newState: targetState || fromState,
      actor,
      eventId: event.id,
    };
  }

  getState(tradeId) {
    return this.repository.findById(tradeId).then((row) => row?.status || null);
  }

  getAllowedTransitions(tradeId) {
    return this.repository.findById(tradeId).then((row) => {
      if (!row) {
        throw new TradeNotFoundError(undefined, { tradeId });
      }
      return this.transitions.getAllowedTransitions(row.status);
    });
  }

  isTerminal(tradeId) {
    return this.repository.findById(tradeId).then((row) => {
      if (!row) {
        throw new TradeNotFoundError(undefined, { tradeId });
      }
      return this.transitions.isTerminal(row.status);
    });
  }
}
module.exports = LifecycleService;