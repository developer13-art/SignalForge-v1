/**
 * Trade Keywords
 *
 * Keywords and phrases used by the rule-based classifier to detect
 * new trade signals. Grouped by strength: strong terms strongly
 * indicate a trade; weak terms are supporting signals.
 *
 * @module signalforge/server/modules/signal-classification/keywords/trade
 */
const STRONG_TRADE_KEYWORDS = Object.freeze([
  'buy now',
  'sell now',
  'buy signal',
  'sell signal',
  'entry:',
  'entry:',
  'entry price',
  'entry at',
  'market order',
  'limit order',
  'stop loss:',
  'sl:',
  'tp:',
  'take profit:',
  'target:',
  'long position',
  'short position',
  'open long',
  'open short',
  'go long',
  'go short',
  'market buy',
  'market sell',
  'place order',
  'place a buy',
  'place a sell',
  'open buy',
  'open sell',
  'entering',
  'entering long',
  'entering short',
]);
const MEDIUM_TRADE_KEYWORDS = Object.freeze([
  'buy ',
  'sell ',
  'long ',
  'short ',
  'entry',
  'target',
  'stop',
  'tp1',
  'tp2',
  'tp3',
  'sl ',
  'entry zone',
  'buy limit',
  'sell limit',
  'buy stop',
  'sell stop',
  'take profit',
  'stop loss',
]);
const WEAK_TRADE_KEYWORDS = Object.freeze([
  'trade',
  'position',
  'order',
  'signal',
  'setup',
  'opportunity',
]);
const TRADE_SYMBOL_HINTS = Object.freeze([
  'xauusd',
  'xagusd',
  'eurusd',
  'gbpusd',
  'usdjpy',
  'audusd',
  'usdcad',
  'usdchf',
  'nzdusd',
  'eurgbp',
  'eurjpy',
  'gbpjpy',
  'us30',
  'nas100',
  'spx500',
  'ger40',
  'uk100',
  'jp225',
  'btcusd',
  'ethusd',
  'solusd',
  'gold',
  'silver',
  'oil',
  'wti',
  'brent',
]);
function countStrongKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of STRONG_TRADE_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}
function countMediumKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of MEDIUM_TRADE_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}
function countWeakKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of WEAK_TRADE_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}
function countSymbolHints(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const symbol of TRADE_SYMBOL_HINTS) {
    if (lower.includes(symbol)) {
      count++;
    }
  }
  return count;
}
module.exports.STRONG_TRADE_KEYWORDS = STRONG_TRADE_KEYWORDS;
module.exports.MEDIUM_TRADE_KEYWORDS = MEDIUM_TRADE_KEYWORDS;
module.exports.WEAK_TRADE_KEYWORDS = WEAK_TRADE_KEYWORDS;
module.exports.TRADE_SYMBOL_HINTS = TRADE_SYMBOL_HINTS;
module.exports.countStrongKeywords = countStrongKeywords;
module.exports.countMediumKeywords = countMediumKeywords;
module.exports.countWeakKeywords = countWeakKeywords;
module.exports.countSymbolHints = countSymbolHints;
