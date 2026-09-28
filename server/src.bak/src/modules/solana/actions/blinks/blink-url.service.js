'use strict';

const crypto = require('crypto');

const {
  BLINK_URL_PREFIX,
  BLINK_URL_QUERY_PARAMS,
  BLINK_SHORT_LINK_LENGTH,
  BLINK_DEFAULT_UTM_SOURCE,
  BLINK_DEFAULT_UTM_MEDIUM,
} = require('./blink.constants');

const { config } = require('../actions.config');

/**
 * SignalForge - Blink URL Service
 *
 * Builds canonical Blink URLs, short links, and share-ready URLs with
 * UTM tracking. All URLs are absolute so that X (Twitter), Telegram,
 * Discord, and email clients can render and share them without
 * additional processing.
 */

function resolveBaseUrl() {
  const base = config.publicBaseUrl || 'https://signalforge.ai';
  return base.replace(/\/+$/, '');
}

function normalizePath(path) {
  if (!path) {
    return '';
  }
  return path.startsWith('/') ? path : `/${path}`;
}

function buildBlinkPath(templateType) {
  return `${BLINK_URL_PREFIX}/${templateType}`;
}

function buildBlinkUrl({
  templateType,
  planId,
  referralCode,
  providerId,
  token,
  amount,
  utm,
} = {}) {
  const base = resolveBaseUrl();
  const path = buildBlinkPath(templateType);
  const params = new URLSearchParams();

  if (planId) {
    params.set(BLINK_URL_QUERY_PARAMS.PLAN_ID, String(planId));
  }
  if (referralCode) {
    params.set(BLINK_URL_QUERY_PARAMS.REFERRAL_CODE, String(referralCode));
  }
  if (providerId) {
    params.set(BLINK_URL_QUERY_PARAMS.PROVIDER_ID, String(providerId));
  }
  if (token) {
    params.set(BLINK_URL_QUERY_PARAMS.TOKEN, String(token).toUpperCase());
  }
  if (amount !== undefined && amount !== null) {
    params.set(BLINK_URL_QUERY_PARAMS.AMOUNT, String(amount));
  }

  if (utm && typeof utm === 'object') {
    if (utm.source) {
      params.set(BLINK_URL_QUERY_PARAMS.UTM_SOURCE, String(utm.source));
    }
    if (utm.medium) {
      params.set(BLINK_URL_QUERY_PARAMS.UTM_MEDIUM, String(utm.medium));
    }
    if (utm.campaign) {
      params.set(BLINK_URL_QUERY_PARAMS.UTM_CAMPAIGN, String(utm.campaign));
    }
  }

  const query = params.toString();
  return query ? `${base}${path}?${query}` : `${base}${path}`;
}

function generateShortCode(length = BLINK_SHORT_LINK_LENGTH) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
}

function buildShortBlinkUrl(shortCode) {
  if (!shortCode) {
    return null;
  }
  const base = resolveBaseUrl();
  return `${base}${BLINK_URL_PREFIX}/s/${shortCode}`;
}

function buildShareUrl({
  blinkUrl,
  text,
  via,
  hashtags,
  channel,
} = {}) {
  if (!blinkUrl) {
    return null;
  }

  const target = String(channel || '').toLowerCase();

  const url = encodeURIComponent(blinkUrl);
  const encodedText = text ? encodeURIComponent(text) : '';
  const viaParam = via ? `&via=${encodeURIComponent(via)}` : '';
  const hashtagsParam = Array.isArray(hashtags) && hashtags.length > 0
    ? `&hashtags=${encodeURIComponent(hashtags.join(','))}`
    : '';

  if (target === 'x' || target === 'twitter') {
    return `https://twitter.com/intent/tweet?url=${url}${encodedText ? `&text=${encodedText}` : ''}${viaParam}${hashtagsParam}`;
  }

  if (target === 'telegram') {
    return `https://t.me/share/url?url=${url}${encodedText ? `&text=${encodedText}` : ''}`;
  }

  if (target === 'whatsapp') {
    return `https://wa.me/?text=${encodedText ? `${encodedText}%20` : ''}${url}`;
  }

  if (target === 'discord') {
    return blinkUrl;
  }

  if (target === 'email') {
    const subject = encodeURIComponent('SignalForge Blink');
    const body = encodeURIComponent(`${text || 'Check out this SignalForge Blink'}\n\n${blinkUrl}`);
    return `mailto:?subject=${subject}&body=${body}`;
  }

  if (target === 'qr') {
    return blinkUrl;
  }

  return blinkUrl;
}

function buildQrPayload(blinkUrl) {
  if (!blinkUrl) {
    return null;
  }
  return {
    type: 'url',
    value: blinkUrl,
    format: 'qr',
  };
}

function withUtmDefaults(utm = {}) {
  return {
    source: utm.source || BLINK_DEFAULT_UTM_SOURCE,
    medium: utm.medium || BLINK_DEFAULT_UTM_MEDIUM,
    campaign: utm.campaign || 'general',
  };
}

function extractBlinkQuery(url) {
  try {
    const parsed = new URL(url);
    return {
      templateType: parsed.pathname.split('/').pop(),
      planId: parsed.searchParams.get(BLINK_URL_QUERY_PARAMS.PLAN_ID),
      referralCode: parsed.searchParams.get(BLINK_URL_QUERY_PARAMS.REFERRAL_CODE),
      providerId: parsed.searchParams.get(BLINK_URL_QUERY_PARAMS.PROVIDER_ID),
      token: parsed.searchParams.get(BLINK_URL_QUERY_PARAMS.TOKEN),
      amount: parsed.searchParams.get(BLINK_URL_QUERY_PARAMS.AMOUNT),
      utm: {
        source: parsed.searchParams.get(BLINK_URL_QUERY_PARAMS.UTM_SOURCE),
        medium: parsed.searchParams.get(BLINK_URL_QUERY_PARAMS.UTM_MEDIUM),
        campaign: parsed.searchParams.get(BLINK_URL_QUERY_PARAMS.UTM_CAMPAIGN),
      },
    };
  } catch (_error) {
    return null;
  }
}

function buildBlinkQrImageUrl(blinkUrl, size = 320) {
  if (!blinkUrl) {
    return null;
  }
  const encoded = encodeURIComponent(blinkUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}

module.exports = {
  resolveBaseUrl,
  normalizePath,
  buildBlinkPath,
  buildBlinkUrl,
  generateShortCode,
  buildShortBlinkUrl,
  buildShareUrl,
  buildQrPayload,
  withUtmDefaults,
  extractBlinkQuery,
  buildBlinkQrImageUrl,
};