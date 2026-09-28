/**
 * Already Closed Check
 *
 * @module signalforge/server/modules/risk/checks/already-closed
 */

import { BaseCheck } from './base.check.js';
import { RISK_CHECKS } from '../risk.constants.js';

export class AlreadyClosedCheck extends BaseCheck {
  constructor() {
    super(RISK_CHECKS.ALREADY_CLOSED);
  }

  async run(context) {
    const { signal, recentTrades } = context;

    if (!signal || !Array.isArray(recentTrades)) {
      return this.pass();
    }

    for (const trade of recentTrades) {
      if (trade.signal_id === signal.signalId) {
        if (['CLOSED', 'ARCHIVED', 'RISK_REJECTED', 'EXECUTION_REJECTED'].includes(trade.status)) {
          return this.fail(
            `Signal ${signal.signalId} has already been closed`,
            { tradeId: trade.id, status: trade.status },
          );
        }
      }
    }

    return this.pass();
  }
}

export default AlreadyClosedCheck;