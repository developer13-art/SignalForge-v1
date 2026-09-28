/**
 * Noise Keywords
 *
 * Keywords used to classify messages that are not trading signals:
 * conversation, news, education, and advertising.
 *
 * @module signalforge/server/modules/signal-classification/keywords/noise
 */
const CONVERSATION_KEYWORDS = Object.freeze([
  'gm',
  'good morning',
  'good afternoon',
  'good evening',
  'good night',
  'hello',
  'hi',
  'hey',
  'thanks',
  'thank you',
  'welcome',
  'congrats',
  'congratulations',
  'well done',
  'happy new year',
  'happy weekend',
  'how are you',
  'how is everyone',
  'stay safe',
  'let us go',
  'let us rock',
]);
const NEWS_KEYWORDS = Object.freeze([
  'breaking news',
  'breaking:',
  'just in',
  'flash:',
  'fed ',
  'fomc',
  'nfp',
  'cpi',
  'ppi',
  'ecb',
  'boe ',
  'boj ',
  'rba ',
  'interest rate',
  'rate hike',
  'rate cut',
  'inflation report',
  'gdp report',
  'employment report',
  'press release',
]);
const EDUCATION_KEYWORDS = Object.freeze([
  'lesson',
  'tutorial',
  'guide',
  'learn ',
  'learning',
  'course',
  'webinar',
  'workshop',
  'masterclass',
  'class ',
  'how to trade',
  'how to read',
  'how to use',
  'strategy explained',
  'explained',
  'basic ',
  'basics of',
  'beginner',
  'beginners',
]);
const ADVERTISEMENT_KEYWORDS = Object.freeze([
  'join our',
  'join us',
  'subscribe',
  'subscription',
  'sign up',
  'signup',
  'promo',
  'discount',
  'special offer',
  'limited offer',
  'limited time',
  'vip group',
  'premium group',
  'click here',
  'link in bio',
  'dm us',
  'dm me',
  'contact us',
  'sponsored',
  'affiliate',
  'giveaway',
]);
function countConversationKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of CONVERSATION_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}
function countNewsKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of NEWS_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}
function countEducationKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of EDUCATION_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}
function countAdvertisementKeywords(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of ADVERTISEMENT_KEYWORDS) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}
module.exports.CONVERSATION_KEYWORDS = CONVERSATION_KEYWORDS;
module.exports.NEWS_KEYWORDS = NEWS_KEYWORDS;
module.exports.EDUCATION_KEYWORDS = EDUCATION_KEYWORDS;
module.exports.ADVERTISEMENT_KEYWORDS = ADVERTISEMENT_KEYWORDS;
module.exports.countConversationKeywords = countConversationKeywords;
module.exports.countNewsKeywords = countNewsKeywords;
module.exports.countEducationKeywords = countEducationKeywords;
module.exports.countAdvertisementKeywords = countAdvertisementKeywords;
