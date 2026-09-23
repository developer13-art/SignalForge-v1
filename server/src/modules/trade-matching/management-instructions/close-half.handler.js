/**
 * Close Half Handler
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/close-half
 */

import { MANAGEMENT_INSTRUCTION_TYPES } from '../matching.constants.js';

export class CloseHalfHandler {
  constructor() {
    this.instructionType = MANAGEMENT_INSTRUCTION_TYPES.CLOSE_HALF;
  }

  canHandle(parsed) {
    if (!parsed) {
      return false;
    }
    const text = (parsed.text || '').toLowerCase();
    return (
      text.includes('close half') ||
      text.includes('close 50%') ||
      text.includes('close 50 percent')
    );
  }

  buildInstruction(parsed) {
    return {
      type: this.instructionType,
      action: 'PARTIAL_CLOSE',
      parameters: {
        percentage: 50,
      },
    };
  }

  apply(trade, instruction) {
    if (!trade) {
      throw new Error('Trade is required');
    }
    return {
      tradeId: trade.id,
      action: instruction.action,
      percentage: instruction.parameters.percentage,
      applied: true,
    };
  }
}

export default CloseHalfHandler;