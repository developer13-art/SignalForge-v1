/**
 * Management Instruction Registry
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/registry
 */
const { MANAGEMENT_INSTRUCTION_TYPES } = require('../matching.constants.js');
const { CloseHalfHandler } = require('./close-half.handler.js');
const { CloseSomeHandler } = require('./close-some.handler.js');
const { CloseAllHandler } = require('./close-all.handler.js');
const { MoveSlBreakEvenHandler } = require('./move-sl-breakeven.handler.js');
const { MoveSlHandler } = require('./move-sl.handler.js');
const { TrailingStopHandler } = require('./trailing-stop.handler.js');
const { PartialCloseHandler } = require('./partial-close.handler.js');
const { SecureProfitHandler } = require('./secure-profit.handler.js');

const handlers = new Map();

handlers.set(MANAGEMENT_INSTRUCTION_TYPES.CLOSE_HALF, () => new CloseHalfHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.CLOSE_SOME, () => new CloseSomeHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.CLOSE_ALL, () => new CloseAllHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.CLOSE_POSITION, () => new CloseAllHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.MOVE_SL_BREAKEVEN, () => new MoveSlBreakEvenHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.MOVE_SL, () => new MoveSlHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.MOVE_TP, () => new MoveSlHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.TRAILING_STOP, () => new TrailingStopHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.PARTIAL_CLOSE, () => new PartialCloseHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.SECURE_PROFIT, () => new SecureProfitHandler());
handlers.set(MANAGEMENT_INSTRUCTION_TYPES.LOCK_PROFIT, () => new SecureProfitHandler());
class ManagementInstructionRegistry {
  static register(instructionType, factory) {
    if (typeof factory !== 'function') {
      throw new Error('Handler factory must be a function');
    }
    handlers.set(instructionType, factory);
  }

  static create(instructionType) {
    const factory = handlers.get(instructionType);
    if (!factory) {
      return null;
    }
    return factory();
  }

  static list() {
    return Array.from(handlers.keys());
  }

  static supports(instructionType) {
    return handlers.has(instructionType);
  }
}
module.exports = ManagementInstructionRegistry;
module.exports.ManagementInstructionRegistry = ManagementInstructionRegistry;
