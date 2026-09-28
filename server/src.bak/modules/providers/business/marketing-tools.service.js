/**
 * Provider Marketing Tools Service
 *
 * @module signalforge/server/modules/providers/business/marketing-tools
 */

const TEMPLATES = Object.freeze({
  WELCOME: {
    key: 'WELCOME',
    subject: 'Welcome to {providerName}',
    body: 'Thanks for subscribing to {providerName}. You will now receive real-time trading signals directly on your connected accounts.',
  },
  PROMOTION: {
    key: 'PROMOTION',
    subject: 'Limited offer from {providerName}',
    body: 'Use code {promoCode} to get {discount} off your next subscription with {providerName}.',
  },
  PERFORMANCE_UPDATE: {
    key: 'PERFORMANCE_UPDATE',
    subject: 'Performance update from {providerName}',
    body: 'This month, {providerName} generated {netProfit} across {tradeCount} trades with a {winRate} win rate.',
  },
});

export class MarketingToolsService {
  listTemplates() {
    return Object.values(TEMPLATES).map((t) => ({
      key: t.key,
      subject: t.subject,
      body: t.body,
    }));
  }

  renderTemplate(key, variables = {}) {
    const template = TEMPLATES[key];
    if (!template) {
      return null;
    }
    let subject = template.subject;
    let body = template.body;
    for (const [name, value] of Object.entries(variables)) {
      subject = subject.replaceAll(`{${name}}`, String(value ?? ''));
      body = body.replaceAll(`{${name}}`, String(value ?? ''));
    }
    return { subject, body };
  }

  buildInviteLink(provider, baseUrl) {
    if (!provider || !provider.slug) {
      return null;
    }
    const base = baseUrl || 'https://signalforge.ai';
    return `${base}/providers/${provider.slug}`;
  }
}

export default MarketingToolsService;