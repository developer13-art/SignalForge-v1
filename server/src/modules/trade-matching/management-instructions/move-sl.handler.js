/**
 * Move Stop Loss Handler
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/move-sl
 */

import { MANAGEMENT_INSTRUCTION_TYPES } from '../matching.constants.js';

export class MoveSlHandler {
  constructor() {
    this.instructionType = MANAGEMENT_INSTRUCTION_TYPES.MOVE_SL;
  }

  canHandle(parsed) {
    if (!parsed) {
      return false;
    }
    const text = (parsed.text || '').toLowerCase();
    return (
      text.includes('move sl') ||
      text.includes('move stop loss') ||
      text.includes('adjust sl') ||
      text.includes('shift sl')
    );
  }

  buildInstruction(parsed) {
    return {
      type: this.instructionType,
      action: 'MODIFY_SL',
      parameters: {
        newStopLoss: parsed.stopLoss || null,
      },
    };
  }

  apply(trade, instruction) {
    if (!instruction.parameters.newStopLoss) {
      throw new Error('New stop loss value is required');
    }
    return {
      tradeId: trade.id,
      action: instruction.action,
      newStopLoss: instruction.parameters.newStopLoss,
      applied: true,
    };
  }
}

export default MoveSlHandler;