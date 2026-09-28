/**
 * Trailing Stop Handler
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/trailing-stop
 */
const { MANAGEMENT_INSTRUCTION_TYPES } = require('../matching.constants.js');
class TrailingStopHandler {
  constructor() {
    this.instructionType = MANAGEMENT_INSTRUCTION_TYPES.TRAILING_STOP;
  }

  canHandle(parsed) {
    if (!parsed) {
      return false;
    }
    const text = (parsed.text || '').toLowerCase();
    return text.includes('trail') || text.includes('trailing stop');
  }

  buildInstruction(parsed) {
    return {
      type: this.instructionType,
      action: 'TRAILING_STOP_ENABLE',
      parameters: {
        distancePips: parsed.distancePips || null,
      },
    };
  }

  apply(trade, instruction) {
    return {
      tradeId: trade.id,
      action: instruction.action,
      distancePips: instruction.parameters.distancePips,
      applied: true,
    };
  }
}
module.exports = TrailingStopHandler;
module.exports.TrailingStopHandler = TrailingStopHandler;
