/**
 * Close Some Handler
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/close-some
 */

import { MANAGEMENT_INSTRUCTION_TYPES } from '../matching.constants.js';

export class CloseSomeHandler {
  constructor() {
    this.instructionType = MANAGEMENT_INSTRUCTION_TYPES.CLOSE_SOME;
  }

  canHandle(parsed) {
    if (!parsed) {
      return false;
    }
    const text = (parsed.text || '').toLowerCase();
    return text.includes('close some') || text.includes('close part');
  }

  buildInstruction(parsed) {
    return {
      type: this.instructionType,
      action: 'PARTIAL_CLOSE',
      parameters: {
        percentage: parsed.percentage || 50,
      },
    };
  }

  apply(trade, instruction) {
    return {
      tradeId: trade.id,
      action: instruction.action,
      percentage: instruction.parameters.percentage,
      applied: true,
    };
  }
}

export default CloseSomeHandler;