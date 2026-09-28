'use strict';

/**
 * SignalForge - Blink Constants
 *
 * Constants specific to Blink templates, lifecycle, and analytics that
 * are not part of the broader Solana Actions specification.
 */

const BLINK_TEMPLATE_DEFINITIONS = Object.freeze({
  subscribe: {
    key: 'subscribe',
    name: 'Subscription Blink',
    description: 'Allows a user to subscribe to a SignalForge plan directly from X or a wallet.',
    requiredFields: ['planId', 'amount', 'tokenSymbol'],
    optionalFields: ['referralCode', 'providerId', 'message', 'iconUrl'],
    defaultLabel: 'Subscribe',
    defaultTitle: 'Subscribe to SignalForge',
    defaultDescription: 'Activate your SignalForge subscription using Solana.',
    supportsReferral: true,
    supportsProvider: true,
  },
  upgrade: {
    key: 'upgrade',
    name: 'Upgrade Blink',
    description: 'Allows an existing subscriber to upgrade to a higher plan.',
    requiredFields: ['planId', 'amount', 'tokenSymbol'],
    optionalFields: ['message', 'iconUrl'],
    defaultLabel: 'Upgrade',
    defaultTitle: 'Upgrade your SignalForge plan',
    defaultDescription: 'Upgrade your SignalForge subscription using Solana.',
    supportsReferral: false,
    supportsProvider: false,
  },
  referral: {
    key: 'referral',
    name: 'Referral Blink',
    description: 'Attracts new users into SignalForge through a referral code.',
    requiredFields: ['referralCode'],
    optionalFields: ['planId', 'message', 'iconUrl'],
    defaultLabel: 'Join',
    defaultTitle: 'Join SignalForge',
    defaultDescription: 'Create your SignalForge account through this referral.',
    supportsReferral: true,
    supportsProvider: false,
  },
  tip: {
    key: 'tip',
    name: 'Tip Blink',
    description: 'Allows users to send a tip to a provider using Solana.',
    requiredFields: ['providerId', 'amount', 'tokenSymbol'],
    optionalFields: ['message', 'iconUrl'],
    defaultLabel: 'Tip',
    defaultTitle: 'Support this provider',
    defaultDescription: 'Send a tip to this provider through Solana.',
    supportsReferral: false,
    supportsProvider: true,
  },
});

const BLINK_LIFECYCLE_STATES = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
});

const BLINK_LIFECYCLE_TRANSITIONS = Object.freeze({
  draft: ['active', 'archived'],
  active: ['paused', 'archived'],
  paused: ['active', 'archived'],
  archived: [],
});

const BLINK_METADATA_KEYS = Object.freeze({
  TEMPLATE_TYPE: 'templateType',
  CREATED_BY: 'createdBy',
  CREATED_VIA: 'createdVia',
  NOTES: 'notes',
  UTM_SOURCE: 'utmSource',
  UTM_MEDIUM: 'utmMedium',
  UTM_CAMPAIGN: 'utmCampaign',
  ORIGIN: 'origin',
});

const BLINK_URL_QUERY_PARAMS = Object.freeze({
  PLAN_ID: 'planId',
  REFERRAL_CODE: 'referralCode',
  PROVIDER_ID: 'providerId',
  TOKEN: 'token',
  AMOUNT: 'amount',
  UTM_SOURCE: 'utm_source',
  UTM_MEDIUM: 'utm_medium',
  UTM_CAMPAIGN: 'utm_campaign',
});

const BLINK_URL_PREFIX = '/api/actions';

const BLINK_SHORT_LINK_LENGTH = 12;

const BLINK_ANALYTICS_WINDOWS = Object.freeze({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL: 'all',
});

const BLINK_ANALYTICS_EVENT_TYPES = Object.freeze({
  VIEW: 'view',
  CLICK: 'click',
  SHARE: 'share',
  POST: 'post',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired',
});

const BLINK_ANALYTICS_GROUP_BY = Object.freeze({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  CHANNEL: 'channel',
  TOKEN: 'token',
  TEMPLATE: 'template',
});

const BLINK_DEFAULT_UTM_SOURCE = 'blink';
const BLINK_DEFAULT_UTM_MEDIUM = 'solana-actions';

const BLINK_MAX_CONVERSIONS_PER_PAGE = 100;
const BLINK_DEFAULT_CONVERSIONS_PER_PAGE = 25;

const BLINK_MAX_AGE_PAUSED_DAYS = 90;
const BLINK_MAX_AGE_ARCHIVED_DAYS = 365;

const BLINK_TEMPLATE_KEYWORDS = Object.freeze({
  subscribe: ['subscribe', 'subscription', 'signup', 'join', 'activate'],
  upgrade: ['upgrade', 'renew', 'extend', 'topup'],
  referral: ['referral', 'invite', 'invitation', 'affiliate'],
  tip: ['tip', 'donate', 'support', 'thank'],
});

module.exports = Object.freeze({
  BLINK_TEMPLATE_DEFINITIONS,
  BLINK_LIFECYCLE_STATES,
  BLINK_LIFECYCLE_TRANSITIONS,
  BLINK_METADATA_KEYS,
  BLINK_URL_QUERY_PARAMS,
  BLINK_URL_PREFIX,
  BLINK_SHORT_LINK_LENGTH,
  BLINK_ANALYTICS_WINDOWS,
  BLINK_ANALYTICS_EVENT_TYPES,
  BLINK_ANALYTICS_GROUP_BY,
  BLINK_DEFAULT_UTM_SOURCE,
  BLINK_DEFAULT_UTM_MEDIUM,
  BLINK_MAX_CONVERSIONS_PER_PAGE,
  BLINK_DEFAULT_CONVERSIONS_PER_PAGE,
  BLINK_MAX_AGE_PAUSED_DAYS,
  BLINK_MAX_AGE_ARCHIVED_DAYS,
  BLINK_TEMPLATE_KEYWORDS,
});