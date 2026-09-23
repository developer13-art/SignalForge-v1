/**
 * Move SL to Break Even Handler
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/move-sl-breakeven
 */

import { MANAGEMENT_INSTRUCTION_TYPES } from '../matching.constants.js';

export class MoveSlBreakEvenHandler {
  constructor() {
    this.instructionType = MANAGEMENT_INSTRUCTION_TYPES.MOVE_SL_BREAKEVEN;
  }

  canHandle(parsed) {
    if (!parsed) {
      return false;
    }
    const text = (parsed.text || '').toLowerCase();
    return (
      text.includes('move sl to be') ||
      text.includes('move sl to breakeven') ||
      text.includes('move stop loss to break even') ||
      text.includes('move stop to breakeven') ||
      text.includes('secure profit') ||
      text.includes('lock profit')
    );
  }

  buildInstruction(parsed) {
    return {
      type: this.instructionType,
      action: 'MODIFY_SL_BREAKEVEN',
      parameters: {
        newStopLoss: null,
      },
    };
  }

  apply(trade, instruction) {
    return {
      tradeId: trade.id,
      action: instruction.action,
      newStopLoss: trade.entry_price,
      applied: true,
    };
  }
}

export default MoveSlBreakEvenHandler;