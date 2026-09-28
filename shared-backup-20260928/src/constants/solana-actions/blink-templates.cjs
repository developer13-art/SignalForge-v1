'use strict';

/**
 * SignalForge - Blink Template Constants
 *
 * Human-readable metadata for each template type. Used by the client
 * to render template pickers and previews, and by the server to seed
 * default values when a Blink is created without explicit metadata.
 */

const BLINK_TEMPLATE_METADATA = Object.freeze({
  subscribe: {
    key: 'subscribe',
    name: 'Subscription Blink',
    shortName: 'Subscribe',
    description: 'Let users subscribe to a SignalForge plan with one click.',
    longDescription:
      'A subscription Blink lets users pay for a SignalForge plan using any supported Solana token. The subscription activates automatically when the transaction confirms on-chain.',
    icon: 'credit-card',
    color: 'indigo',
    supportsReferral: true,
    supportsProvider: true,
    requiresAmount: true,
    defaultLabel: 'Subscribe',
    defaultTitle: 'Subscribe to SignalForge',
    defaultDescription: 'Activate your SignalForge subscription using Solana.',
  },
  upgrade: {
    key: 'upgrade',
    name: 'Upgrade Blink',
    shortName: 'Upgrade',
    description: 'Let existing subscribers upgrade to a higher plan.',
    longDescription:
      'An upgrade Blink lets an existing subscriber move to a higher tier with a single Solana transaction.',
    icon: 'arrow-up-circle',
    color: 'violet',
    supportsReferral: false,
    supportsProvider: false,
    requiresAmount: true,
    defaultLabel: 'Upgrade',
    defaultTitle: 'Upgrade your SignalForge plan',
    defaultDescription: 'Upgrade your SignalForge subscription using Solana.',
  },
  referral: {
    key: 'referral',
    name: 'Referral Blink',
    shortName: 'Referral',
    description: 'Attract new users through a referral code.',
    longDescription:
      'A referral Blink redirects new users into SignalForge through a permanent referral code, recording the referral relationship on-chain.',
    icon: 'users',
    color: 'emerald',
    supportsReferral: true,
    supportsProvider: false,
    requiresAmount: false,
    defaultLabel: 'Join',
    defaultTitle: 'Join SignalForge',
    defaultDescription: 'Create your SignalForge account through this referral.',
  },
  tip: {
    key: 'tip',
    name: 'Tip Blink',
    shortName: 'Tip',
    description: 'Let users tip a provider directly on Solana.',
    longDescription:
      'A tip Blink routes a payment directly to the provider treasury wallet. Tips are recorded on-chain and shown in the provider dashboard.',
    icon: 'heart',
    color: 'rose',
    supportsReferral: false,
    supportsProvider: true,
    requiresAmount: true,
    defaultLabel: 'Tip',
    defaultTitle: 'Support this provider',
    defaultDescription: 'Send a tip to this provider through Solana.',
  },
});

const BLINK_TEMPLATE_LIST = Object.values(BLINK_TEMPLATE_METADATA);

const BLINK_TEMPLATE_KEYS = BLINK_TEMPLATE_LIST.map((template) => template.key);

module.exports = Object.freeze({
  BLINK_TEMPLATE_METADATA,
  BLINK_TEMPLATE_LIST,
  BLINK_TEMPLATE_KEYS,
});