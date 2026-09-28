'use strict';

const {
  ACTIONS_HANDLER_NAMES,
  ACTIONS_BLINK_TEMPLATE_TYPES,
} = require('../actions.constants');

const { InvalidActionError } = require('../actions.errors');

const subscribeHandler = require('./subscribe.handler');
const upgradeHandler = require('./upgrade.handler');
const referralHandler = require('./referral.handler');
const tipHandler = require('./tip.handler');

/**
 * SignalForge - Handler Registry
 *
 * Central registry that maps a template type to its handler. New
 * template types must be added here and in the constants module; the
 * registry is the only place where handler identity is defined.
 */

const REGISTRY = Object.freeze({
  [ACTIONS_BLINK_TEMPLATE_TYPES.SUBSCRIBE]: subscribeHandler,
  [ACTIONS_BLINK_TEMPLATE_TYPES.UPGRADE]: upgradeHandler,
  [ACTIONS_BLINK_TEMPLATE_TYPES.REFERRAL]: referralHandler,
  [ACTIONS_BLINK_TEMPLATE_TYPES.TIP]: tipHandler,
});

function getHandler(name) {
  if (!name) {
    return null;
  }
  const normalized = String(name).trim().toLowerCase();
  return REGISTRY[normalized] || null;
}

function getHandlerOrThrow(name) {
  const handler = getHandler(name);
  if (!handler) {
    throw new InvalidActionError(`No handler is registered for ${name}`, {
      name,
      available: Object.keys(REGISTRY),
    });
  }
  return handler;
}

function hasHandler(name) {
  return Boolean(getHandler(name));
}

function listHandlers() {
  return Object.keys(REGISTRY).map((key) => ({
    name: key,
    handle: REGISTRY[key].handle,
    build: REGISTRY[key].build,
  }));
}

function registerHandler(name, handler) {
  throw new InvalidActionError(
    'Dynamic handler registration is disabled; handlers must be declared at build time',
    { attemptedName: name, handler: Boolean(handler) },
  );
}

module.exports = {
  REGISTRY,
  ACTIONS_HANDLER_NAMES,
  getHandler,
  getHandlerOrThrow,
  hasHandler,
  listHandlers,
  registerHandler,
};