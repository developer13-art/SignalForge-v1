/**
 * Webhook Payload Validator
 *
 * Provides validation for webhook payloads received from payment
 * providers, KYC providers, and other external services.
 *
 * @module @signalforge/shared/validators/webhook-payload
 */

import crypto from 'node:crypto';

const MAX_WEBHOOK_PAYLOAD_SIZE = 1024 * 1024;

export function validateStripeWebhookPayload(payload, signature, secret) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object');
    return { valid: false, errors };
  }

  if (typeof signature !== 'string' || signature.length === 0) {
    errors.push('Stripe signature header is required');
  }

  if (typeof secret !== 'string' || secret.length === 0) {
    errors.push('Stripe webhook secret is required');
  }

  if (!payload.id || typeof payload.id !== 'string') {
    errors.push('Stripe event id is required');
  }

  if (!payload.type || typeof payload.type !== 'string') {
    errors.push('Stripe event type is required');
  }

  if (!payload.data || typeof payload.data !== 'object') {
    errors.push('Stripe event data is required');
  }

  return { valid: errors.length === 0, errors };
}

export function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (typeof signatureHeader !== 'string' || typeof secret !== 'string') {
    return false;
  }

  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((p) => p.startsWith('t='));
  const signaturePart = parts.find((p) => p.startsWith('v1='));

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = timestampPart.substring(2);
  const providedSignature = signaturePart.substring(3);

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  const providedBuffer = Buffer.from(providedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export function validatePaystackWebhookPayload(payload, signature, secret) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object');
    return { valid: false, errors };
  }

  if (typeof signature !== 'string' || signature.length === 0) {
    errors.push('Paystack signature header is required');
  }

  if (typeof secret !== 'string' || secret.length === 0) {
    errors.push('Paystack webhook secret is required');
  }

  if (!payload.event || typeof payload.event !== 'string') {
    errors.push('Paystack event type is required');
  }

  if (!payload.data || typeof payload.data !== 'object') {
    errors.push('Paystack event data is required');
  }

  return { valid: errors.length === 0, errors };
}

export function verifyPaystackSignature(rawBody, signatureHeader, secret) {
  if (typeof signatureHeader !== 'string' || typeof secret !== 'string') {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  const providedBuffer = Buffer.from(signatureHeader, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export function validateFlutterwaveWebhookPayload(payload, signature, secret) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object');
    return { valid: false, errors };
  }

  if (typeof secret !== 'string' || secret.length === 0) {
    errors.push('Flutterwave webhook secret is required');
  }

  if (signature !== secret) {
    errors.push('Flutterwave signature does not match');
  }

  if (payload.status === undefined) {
    errors.push('Flutterwave status is required');
  }

  if (!payload.txRef && !payload.data) {
    errors.push('Flutterwave transaction reference or data is required');
  }

  return { valid: errors.length === 0, errors };
}

export function validateKycWebhookPayload(payload, options = {}) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object');
    return { valid: false, errors };
  }

  if (!payload.applicationId && !payload.reference) {
    errors.push('KYC application id or reference is required');
  }

  if (!payload.status && !payload.result) {
    errors.push('KYC status or result is required');
  }

  if (options.requiredSignature && !payload.signature) {
    errors.push('KYC webhook signature is required');
  }

  return { valid: errors.length === 0, errors };
}

export function validateWebhookSize(rawBody) {
  if (!rawBody) {
    return { valid: false, error: 'Body is required' };
  }

  const size = Buffer.isBuffer(rawBody)
    ? rawBody.length
    : Buffer.byteLength(rawBody, 'utf8');

  if (size > MAX_WEBHOOK_PAYLOAD_SIZE) {
    return {
      valid: false,
      error: `Webhook payload exceeds maximum size of ${MAX_WEBHOOK_PAYLOAD_SIZE} bytes`,
    };
  }

  return { valid: true };
}

export function validateGenericWebhookPayload(payload, options = {}) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be an object');
    return { valid: false, errors };
  }

  if (options.requiredFields && Array.isArray(options.requiredFields)) {
    for (const field of options.requiredFields) {
      if (payload[field] === undefined || payload[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  if (options.allowedSources && Array.isArray(options.allowedSources)) {
    if (!payload.source || !options.allowedSources.includes(payload.source)) {
      errors.push('Source is not permitted');
    }
  }

  return { valid: errors.length === 0, errors };
}

export const WEBHOOK_CONSTRAINTS = Object.freeze({
  maxSize: MAX_WEBHOOK_PAYLOAD_SIZE,
});