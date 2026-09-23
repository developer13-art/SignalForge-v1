/**
 * Language Service
 *
 * Detects the language of a message so downstream parsers can route
 * to translation or multilingual models as needed.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/language
 */

const LANGUAGE_HINTS = Object.freeze({
  pt: ['negociar', 'comprar', 'vender', 'lucro', 'mercado', 'entrada', 'saída', 'alvo'],
  es: ['comprar', 'vender', 'entrada', 'objetivo', 'mercado', 'ganancia', 'precio'],
  fr: ['acheter', 'vendre', 'entrée', 'objectif', 'marché', 'prix', 'stop'],
  de: ['kaufen', 'verkaufen', 'einstieg', 'ziel', 'markt', 'preis'],
  it: ['comprare', 'vendere', 'entrata', 'obiettivo', 'mercato', 'prezzo'],
  ru: ['купить', 'продать', 'вход', 'цель', 'рынок', 'цена'],
  ar: ['شراء', 'بيع', 'دخول', 'هدف', 'سوق', 'سعر'],
  zh: ['买入', '卖出', '入场', '目标', '市场', '价格'],
  ja: ['買い', '売り', 'エントリー', 'ターゲット', '市場', '価格'],
});

export class LanguageService {
  detect(text) {
    if (typeof text !== 'string' || text.length === 0) {
      return 'en';
    }

    const lower = text.toLowerCase();
    const scores = { en: 0 };

    for (const [lang, hints] of Object.entries(LANGUAGE_HINTS)) {
      let count = 0;
      for (const hint of hints) {
        if (lower.includes(hint.toLowerCase())) {
          count++;
        }
      }
      if (count > 0) {
        scores[lang] = count;
      }
    }

    let best = 'en';
    let bestScore = 0;
    for (const [lang, score] of Object.entries(scores)) {
      if (score > bestScore) {
        best = lang;
        bestScore = score;
      }
    }

    return best;
  }

  isEnglish(text) {
    return this.detect(text) === 'en';
  }
}

export default LanguageService;