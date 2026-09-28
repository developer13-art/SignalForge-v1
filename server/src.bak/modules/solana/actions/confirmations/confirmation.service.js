'use strict';

const crypto = require('crypto');

const confirmationRepository = require('./confirmation.repository');
const confirmationVerifier = require('./confirmation-verifier.service');
const confirmationIdempotency = require('./confirmation-idempotency.service');

const actionsRepository = require('../actions.repository');

const {
  ACTIONS_BLINK_CONVERSION_STATUSES,
  ACTIONS_BLINK_TEMPLATE_TYPES,
} = require('../actions.constants');

const {
  ConfirmationFailedError,
  ConfirmationTimeoutError,
  NotFoundError,
} = require('../actions.errors');

const {
  buildPaymentConfirmedEvent,
  buildPaymentFailedEvent,
  buildSubscriptionActivatedEvent,
  buildReferralAttributedEvent,
} = require('../actions.events');

/**
 * SignalForge - Confirmation Service
 *
 * Orchestrates confirmation of a Blink payment: verifies the on-chain
 * signature, marks the conversion as confirmed, activates the
 * associated subscription, attributes referrals, and emits the
 * corresponding events. All state transitions are idempotent.
 */

function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function emitEvent(name, payload) {
  const bus = global.__signalforgeEventBus;
  if (bus && typeof bus.publish === 'function') {
    bus.publish(name, payload);
  }
}

async function activateSubscription({ conversion, blink, wallet, signature, requestId }) {
  const service = safeRequire('../../../subscriptions/subscription.service');
  if (!service || typeof service.activateFromBlink !== 'function') {
    return null;
  }

  try {
    const subscription = await service.activateFromBlink({
      userId: conversion.user_id || null,
      planId: blink.plan_id,
      walletAddress: wallet,
      signature,
      source: 'solana-blink',
      amount: conversion.amount,
      tokenSymbol: conversion.token_symbol,
      requestId,
    });
    return subscription;
  } catch (error) {
    emitEvent('solana.blink.subscription.activation.failed', {
      blinkId: blink.id,
      wallet,
      signature,
      reason: error.message,
    });
    return null;
  }
}

async function attributeReferral({ conversion, blink, wallet, signature, requestId }) {
  if (!blink.referral_code) {
    return null;
  }

  const service = safeRequire('../../../referrals/relationship.service');
  if (!service || typeof service.attributeFromBlink !== 'function') {
    return null;
  }

  try {
    const relationship = await service.attributeFromBlink({
      referralCode: blink.referral_code,
      walletAddress: wallet,
      signature,
      source: 'solana-blink',
      requestId,
    });
    return relationship;
  } catch (error) {
    emitEvent('solana.blink.referral.attribution.failed', {
      blinkId: blink.id,
      wallet,
      signature,
      reason: error.message,
    });
    return null;
  }
}

function safeRequire(modulePath) {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(modulePath);
  } catch (_error) {
    return null;
  }
}

async function confirmSignature({
  signature,
  blinkId,
  conversionId,
  wallet,
  amount,
  tokenSymbol,
  tokenMint,
  reference,
  requestId,
  commitment,
}) {
  const existing = await confirmationRepository.findBySignature(signature);
  if (existing && existing.status === 'confirmed') {
    return {
      confirmation: existing,
      alreadyConfirmed: true,
    };
  }

  const reservation = await confirmationIdempotency.reserve({
    key: `sig_${signature}`,
    signature,
    blinkId,
    wallet,
  });

  if (!reservation.reserved && reservation.record && reservation.record.conversion_id) {
    return {
      confirmation: null,
      alreadyConfirmed: true,
      duplicate: true,
    };
  }

  const confirmation = existing
    ? existing
    : await confirmationRepository.createConfirmation(null, {
        id: generateId('confirm'),
        blinkId,
        conversionId: conversionId || null,
        signature,
        reference: reference || null,
        wallet,
        amount,
        tokenSymbol,
        tokenMint,
        status: 'processing',
        commitment: commitment || 'confirmed',
      });

  let verificationResult;
  try {
    verificationResult = await confirmationVerifier.verify({
      signature,
      commitment,
    });
  } catch (error) {
    const failed = await confirmationRepository.updateStatus(confirmation.id, {
      status: 'failed',
      errorMessage: error.message,
    });

    if (conversionId) {
      await actionsRepository.updateConversionStatus(
        conversionId,
        ACTIONS_BLINK_CONVERSION_STATUSES.FAILED,
        { reason: error.message },
      );
    }

    emitEvent(
      'solana.blink.payment.failed',
      buildPaymentFailedEvent({
        blinkId,
        wallet,
        signature,
        reason: error.message,
        requestId,
      }).payload,
    );

    if (error instanceof ConfirmationTimeoutError) {
      throw error;
    }
    if (error instanceof ConfirmationFailedError) {
      throw error;
    }
    throw new ConfirmationFailedError('Confirmation verification failed', {
      reason: error.message,
      signature,
    });
  }

  const confirmed = await confirmationRepository.updateStatus(confirmation.id, {
    status: 'confirmed',
    blockSlot: verificationResult.slot,
    blockTime: verificationResult.transaction?.blockTime || null,
    commitment: verificationResult.confirmationStatus || commitment || 'confirmed',
    rawPayload: {
      slot: verificationResult.slot,
      confirmationStatus: verificationResult.confirmationStatus,
      attempts: verificationResult.attempts,
    },
  });

  const blink = await actionsRepository.findBlinkById(blinkId);

  const subscription = blink
    ? await activateSubscription({
        conversion: { id: conversionId, amount, token_symbol: tokenSymbol, user_id: null },
        blink,
        wallet,
        signature,
        requestId,
      })
    : null;

  const referralRelationship =
    blink && blink.referral_code
      ? await attributeReferral({
          conversion: { id: conversionId, amount, token_symbol: tokenSymbol },
          blink,
          wallet,
          signature,
          requestId,
        })
      : null;

  if (conversionId) {
    await actionsRepository.updateConversionStatus(
      conversionId,
      ACTIONS_BLINK_CONVERSION_STATUSES.CONFIRMED,
      {
        blockSlot: verificationResult.slot,
        subscriptionId: subscription ? subscription.id : null,
        referralRelationshipId: referralRelationship ? referralRelationship.id : null,
      },
    );
  }

  if (reservation.record) {
    await confirmationIdempotency.attachConversion({
      key: reservation.record.key,
      conversionId,
    });
  }

  emitEvent(
    'solana.blink.payment.confirmed',
    buildPaymentConfirmedEvent({
      blinkId,
      wallet,
      signature,
      subscriptionId: subscription ? subscription.id : null,
      requestId,
    }).payload,
  );

  if (subscription) {
    emitEvent(
      'solana.blink.subscription.activated',
      buildSubscriptionActivatedEvent({
        blinkId,
        wallet,
        subscriptionId: subscription.id,
        planId: subscription.planId || (blink ? blink.plan_id : null),
        requestId,
      }).payload,
    );
  }

  if (referralRelationship) {
    emitEvent(
      'solana.blink.referral.attributed',
      buildReferralAttributedEvent({
        blinkId,
        wallet,
        referrerId: referralRelationship.referrerId || null,
        referralRelationshipId: referralRelationship.id,
        requestId,
      }).payload,
    );
  }

  return {
    confirmation: confirmed,
    subscription,
    referralRelationship,
    alreadyConfirmed: false,
  };
}

async function getConfirmationBySignature(signature) {
  const confirmation = await confirmationRepository.findBySignature(signature);
  if (!confirmation) {
    throw new NotFoundError('Confirmation was not found');
  }
  return confirmation;
}

async function listPendingConfirmations(options) {
  return confirmationRepository.listPending(options);
}

async function listByWallet({ wallet, page, pageSize }) {
  if (!wallet) {
    throw new NotFoundError('Wallet is required');
  }
  return confirmationRepository.listByWallet({ wallet, page, pageSize });
}

async function listByBlink({ blinkId, page, pageSize }) {
  if (!blinkId) {
    throw new NotFoundError('Blink is required');
  }
  return confirmationRepository.listByBlink({ blinkId, page, pageSize });
}

async function aggregateByStatus({ blinkId }) {
  return confirmationRepository.aggregateByStatus({ blinkId });
}

async function cleanupOldConfirmations({ olderThanDays }) {
  return confirmationRepository.deleteOldConfirmations({ olderThanDays });
}

module.exports = {
  confirmSignature,
  getConfirmationBySignature,
  listPendingConfirmations,
  listByWallet,
  listByBlink,
  aggregateByStatus,
  cleanupOldConfirmations,
  activateSubscription,
  attributeReferral,
};