/**
 * Symbol Formatter
 *
 * @module client/src/lib/formatters/symbol.formatter
 */

const SYMBOL_DISPLAY = {
  XAUUSD: 'Gold / US Dollar',
  XAGUSD: 'Silver / US Dollar',
  EURUSD: 'Euro / US Dollar',
  GBPUSD: 'British Pound / US Dollar',
  USDJPY: 'US Dollar / Japanese Yen',
  AUDUSD: 'Australian Dollar / US Dollar',
  USDCAD: 'US Dollar / Canadian Dollar',
  USDCHF: 'US Dollar / Swiss Franc',
  NZDUSD: 'New Zealand Dollar / US Dollar',
  EURGBP: 'Euro / British Pound',
  EURJPY: 'Euro / Japanese Yen',
  GBPJPY: 'British Pound / Japanese Yen',
  BTCUSD: 'Bitcoin / US Dollar',
  ETHUSD: 'Ethereum / US Dollar',
  SOLUSD: 'Solana / US Dollar',
  US30: 'Dow Jones 30',
  NAS100: 'Nasdaq 100',
  SPX500: 'S&P 500',
  GER40: 'DAX 40',
  UK100: 'FTSE 100',
  JP225: 'Nikkei 225',
};

export function formatSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    return '—';
  }
  return symbol.toUpperCase();
}

export function formatSymbolLabel(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    return '—';
  }
  const upper = symbol.toUpperCase();
  return SYMBOL_DISPLAY[upper] || upper;
}

export function getSymbolCategory(symbol) {
  if (!symbol) {
    return 'UNKNOWN';
  }
  const upper = String(symbol).toUpperCase();

  if (upper === 'XAUUSD' || upper === 'XAGUSD') {
    return 'METAL';
  }

  const indices = ['US30', 'NAS100', 'SPX500', 'GER40', 'UK100', 'JP225'];
  if (indices.includes(upper)) {
    return 'INDEX';
  }

  if (upper === 'BTCUSD' || upper === 'ETHUSD' || upper === 'SOLUSD') {
    return 'CRYPTO';
  }

  if (/^[A-Z]{6}$/.test(upper)) {
    return 'FOREX';
  }

  return 'UNKNOWN';
}

export function getSymbolCategoryLabel(symbol) {
  const category = getSymbolCategory(symbol);
  switch (category) {
    case 'FOREX':
      return 'Forex';
    case 'METAL':
      return 'Commodities';
    case 'INDEX':
      return 'Indices';
    case 'CRYPTO':
      return 'Crypto';
    default:
      return 'Other';
  }
}

export function getSymbolCategoryColor(symbol) {
  const category = getSymbolCategory(symbol);
  switch (category) {
    case 'FOREX':
      return '#3B82F6';
    case 'METAL':
      return '#F59E0B';
    case 'INDEX':
      return '#8B5CF6';
    case 'CRYPTO':
      return '#F97316';
    default:
      return '#64748B';
  }
}

export const symbolFormatter = {
  formatSymbol,
  formatSymbolLabel,
  getSymbolCategory,
  getSymbolCategoryLabel,
  getSymbolCategoryColor,
};