'use strict';

const crypto = require('crypto');

const confirmationService = require('./confirmation.service');

const { config } = require('../actions.config');
const { InvalidParameterError, ConfirmationFailedError } = require('../actions.errors');

/**
 * SignalForge - Confirmation Webhook Service
 *
 * Ingests webhook notifications from Solana RPC providers (Helius,
 * QuickNode) when a Blink-related transaction is observed on-chain.
 * The service verifies the payload signature, extracts the signature
 * and reference, and delegates to the confirmation service so that
 * state transitions remain centralized.
 */

const PROVIDERS = Object.freeze({
  HELIUS: 'helius',
  QUICKNODE: 'quicknode',
  GENERIC: 'generic',
});

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function verifyHeliusSignature({ rawBody, signature }) {
  if (!config.webhooks.heliusWebhookSecret) {
    throw new InvalidParameterError('Helius webhook secret is not configured');
  }
  const expected = crypto
    .createHmac('sha256', config.webhooks.heliusWebhookSecret)
    .update(rawBody)
    .digest('hex');

  const provided = String(signature || '').replace(/^sha256=/, '');

  if (!timingSafeEqual(expected, provided)) {
    throw new InvalidParameterError('Invalid Helius webhook signature');
  }
  return true;
}

function verifyQuickNodeSignature({ rawBody, signature }) {
  if (!config.webhooks.quicknodeApiKey) {
    throw new InvalidParameterError('QuickNode API key is not configured');
  }
  const expected = crypto
    .createHmac('sha256', config.webhooks.quicknodeApiKey)
    .update(rawBody)
    .digest('hex');

  if (!timingSafeEqual(expected, String(signature || ''))) {
    throw new InvalidParameterError('Invalid QuickNode webhook signature');
  }
  return true;
}

function verifyGenericSignature({ rawBody, signature, secret }) {
  if (!secret) {
    throw new InvalidParameterError('Generic webhook secret is not configured');
  }
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (!timingSafeEqual(expected, String(signature || ''))) {
    throw new InvalidParameterError('Invalid webhook signature');
  }
  return true;
}

function normalizeHeliusPayload(payload) {
  if (!Array.isArray(payload)) {
    throw new InvalidParameterError('Helius payload must be an array');
  }

  const events = [];

  for (const entry of payload) {
    if (!entry) {
      continue;
    }

    const signature = entry.signature || (entry.transaction && entry.transaction.signatures?.[0]) || null;
    if (!signature) {
      continue;
    }

    const reference =
      entry.reference ||
      (entry.accountData && entry.accountData[0]?.account) ||
      null;

    const events.push({
      signature,
      reference,
      raw: entry,
    });
  }

  return events;
}

function normalizeQuickNodePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new InvalidParameterError('QuickNode payload must be an object');
  }

  const signature =
    payload.signature ||
    (Array.isArray(payload.transaction?.signatures) ? payload.transaction.signatures[0] : null);

  if (!signature) {
    throw new InvalidParameterError('QuickNode payload does not contain a signature');
  }

  return [
    {
      signature,
      reference: payload.reference || null,
      raw: payload,
    },
  ];
}

function normalizeGenericPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new InvalidParameterError('Webhook payload must be an object');
  }

  const signature = payload.signature || payload.txSignature || null;
  if (!signature) {
    throw new InvalidParameterError('Webhook payload does not contain a signature');
  }

  return [
    {
      signature,
      reference: payload.reference || null,
      raw: payload,
    },
  ];
}

function resolveProvider(provider, payload) {
  if (provider) {
    return String(provider).toLowerCase();
  }
  if (Array.isArray(payload)) {
    return PROVIDERS.HELIUS;
  }
  if (payload && payload.blockTime !== undefined && payload.signature) {
    return PROVIDERS.QUICKNODE;
  }
  return PROVIDERS.GENERIC;
}

function normalizePayload(provider, payload) {
  switch (provider) {
    case PROVIDERS.HELIUS:
      return normalizeHeliusPayload(payload);
    case PROVIDERS.QUICKNODE:
      return normalizeQuickNodePayload(payload);
    case PROVIDERS.GENERIC:
    default:
      return normalizeGenericPayload(payload);
  }
}

async function handleWebhook({ provider, payload, rawBody, signature, secret }) {
  const resolvedProvider = resolveProvider(provider, payload);

  if (resolvedProvider === PROVIDERS.HELIUS) {
    verifyHeliusSignature({ rawBody, signature });
  } else if (resolvedProvider === PROVIDERS.QUICKNODE) {
    verifyQuickNodeSignature({ rawBody, signature });
  } else {
    verifyGenericSignature({ rawBody, signature, secret });
  }

  const events = normalizePayload(resolvedProvider, payload);

  const results = [];

  for (const event of events) {
    try {
      const result = await confirmationService.confirmSignature({
        signature: event.signature,
        blinkId: event.raw?.blinkId || null,
        conversionId: event.raw?.conversionId || null,
        wallet: event.raw?.wallet || null,
        amount: event.raw?.amount || null,
        tokenSymbol: event.raw?.tokenSymbol || null,
        tokenMint: event.raw?.tokenMint || null,
        reference: event.reference,
        requestId: null,
        commitment: config.commitment,
      });

      results.push({
        signature: event.signature,
        confirmed: true,
        subscription: result.subscription || null,
      });
    } catch (error) {
      if (error instanceof ConfirmationFailedError) {
        results.push({
          signature: event.signature,
          confirmed: false,
          error: error.message,
        });
      } else {
        results.push({
          signature: event.signature,
          confirmed: false,
          error: error.message,
        });
      }
    }
  }

  return {
    provider: resolvedProvider,
    processed: results.length,
    results,
  };
}

module.exports = {
  PROVIDERS,
  verifyHeliusSignature,
  verifyQuickNodeSignature,
  verifyGenericSignature,
  normalizeHeliusPayload,
  normalizeQuickNodePayload,
  normalizeGenericPayload,
  normalizePayload,
  resolveProvider,
  handleWebhook,
};