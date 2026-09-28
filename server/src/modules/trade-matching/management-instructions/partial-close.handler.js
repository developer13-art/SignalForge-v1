/**
 * Partial Close Handler
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/partial-close
 */
const { MANAGEMENT_INSTRUCTION_TYPES } = require('../matching.constants.js');
class PartialCloseHandler {
  constructor() {
    this.instructionType = MANAGEMENT_INSTRUCTION_TYPES.PARTIAL_CLOSE;
  }

  canHandle(parsed) {
    if (!parsed) {
      return false;
    }
    const text = (parsed.text || '').toLowerCase();
    return text.includes('partial close') || text.includes('partials');
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
module.exports = PartialCloseHandler;
module.exports.PartialCloseHandler = PartialCloseHandler;
