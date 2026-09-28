/**
 * Close All Handler
 *
 * @module signalforge/server/modules/trade-matching/management-instructions/close-all
 */
const { MANAGEMENT_INSTRUCTION_TYPES } = require('../matching.constants.js');
class CloseAllHandler {
  constructor() {
    this.instructionType = MANAGEMENT_INSTRUCTION_TYPES.CLOSE_ALL;
  }

  canHandle(parsed) {
    if (!parsed) {
      return false;
    }
    const text = (parsed.text || '').toLowerCase();
    return (
      text.includes('close all') ||
      text.includes('close now') ||
      text.includes('close position') ||
      text.includes('close the trade') ||
      text.includes('exit now') ||
      text.includes('exit position')
    );
  }

  buildInstruction() {
    return {
      type: this.instructionType,
      action: 'CLOSE',
      parameters: {
        percentage: 100,
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
module.exports = CloseAllHandler;
module.exports.CloseAllHandler = CloseAllHandler;
