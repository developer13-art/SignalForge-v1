/**
 * Execute Trade Job
 *
 * @module server/jobs/job-types/execute-trade.job
 */
const { registerJobHandler } = require('../job-registry');
const { logger } = require('../../lib/logger');

async function handler(payload) {
  if (!payload.tradeId) {
    return;
  }

  logger.debug({ tradeId: payload.tradeId }, 'Executing trade');

  try {
    const { executionService } = await import('../../modules/execution/execution.service');

    if (executionService && typeof executionService.executeTrade === 'function') {
      await executionService.executeTrade({ tradeId: payload.tradeId });
    }
  } catch (err) {
    logger.warn({ err, tradeId: payload.tradeId }, 'Execution service unavailable');
  }
}
function registerExecuteTradeJob() {
  registerJobHandler({
    jobType: 'EXECUTE_TRADE',
    handler,
  });
}
module.exports = handler;
module.exports.registerExecuteTradeJob = registerExecuteTradeJob;
