/**
 * Secure Profit Handler
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/secure-profit
 */

import { MANAGEMENT_INSTRUCTION_TYPES } from '../matching.constants.js';

export class SecureProfitHandler {
  constructor() {
    this.instructionType = MANAGEMENT_INSTRUCTION_TYPES.SECURE_PROFIT;
  }

  canHandle(parsed) {
    if (!parsed) {
      return false;
    }
    const text = (parsed.text || '').toLowerCase();
    return text.includes('secure profit') || text.includes('lock profit') || text.includes('book profit');
  }

  buildInstruction() {
    return {
      type: this.instructionType,
      action: 'MODIFY_SL_BREAKEVEN',
      parameters: {},
    };
  }

  apply(trade) {
    return {
      tradeId: trade.id,
      action: 'MODIFY_SL_BREAKEVEN',
      newStopLoss: trade.entry_price,
      applied: true,
    };
  }
}

export default SecureProfitHandler;