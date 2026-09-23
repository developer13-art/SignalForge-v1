/**
 * Management Instruction Registry
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/registry
 */

import { MANAGEMENT_INSTRUCTION_TYPES } from '../matching.constants.js';
import { CloseHalfHandler } from './close-half.handler.js';
import { CloseSomeHandler } from './close-some.handler.js';
import { CloseAllHandler } from './close-all.handler.js';
import { MoveSlBreakEvenHandler } from './move-sl-breakeven.handler.js';
import { MoveSlHandler } from './move-sl.handler.js';
import { TrailingStopHandler } from './trailing-stop.handler.js';
import { PartialCloseHandler } from './partial-close.handler.js';
import { SecureProfitHandler } from './secure-profit.handler.js';

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

export class ManagementInstructionRegistry {
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

export default ManagementInstructionRegistry;