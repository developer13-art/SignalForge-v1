/**
 * News Filter Check
 *
 * @module signalforge/server/modules/risk/checks/news-filter
 */
const { BaseCheck } = require('./base.check.js');
const { RISK_CHECKS } = require('../risk.constants.js');
const { emitRiskNewsFilterBlocked } = require('../risk.events.js');
const { NewsFilterService } = require('../news/news-filter.service.js');
class NewsFilterCheck extends BaseCheck {
  constructor(newsFilterService = null) {
    super(RISK_CHECKS.NEWS_FILTER);
    this.newsFilter = newsFilterService || new NewsFilterService();
  }

  async run(context) {
    const { profile, userId, signal } = context;

    if (!profile || !profile.news_filter_enabled) {
      return this.pass();
    }

    const symbol = signal?.normalizedSymbol || signal?.symbol;
    if (!symbol) {
      return this.skip('NO_SYMBOL');
    }

    const now = context.referenceTime ? new Date(context.referenceTime) : new Date();

    const block = await this.newsFilter.checkBlock({
      symbol,
      referenceTime: now,
      minutesBefore: profile.news_filter_minutes_before,
      minutesAfter: profile.news_filter_minutes_after,
    });

    if (block.blocked) {
      await emitRiskNewsFilterBlocked(userId, symbol, block.event);
      return this.fail(
        `Blocked by news filter: ${block.event?.title || 'High-impact event'}`,
        block,
      );
    }

    return this.pass();
  }
}
module.exports = NewsFilterCheck;
module.exports.NewsFilterCheck = NewsFilterCheck;
