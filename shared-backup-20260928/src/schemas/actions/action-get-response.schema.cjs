'use strict';

/**
 * SignalForge - Solana Actions GET Response Schema
 *
 * A GET request to a Solana Actions endpoint returns metadata that
 * describes the action. This module validates and builds that
 * response payload.
 */

const ACTION_GET_RESPONSE_SCHEMA = Object.freeze({
  type: 'object',
  required: ['type', 'icon', 'title', 'description', 'label', 'links'],
  properties: {
    type: { type: 'string', enum: ['action', 'completed', 'message'] },
    icon: { type: 'string', format: 'uri' },
    title: { type: 'string', minLength: 1, maxLength: 80 },
    description: { type: 'string', minLength: 1, maxLength: 300 },
    label: { type: 'string', minLength: 1, maxLength: 40 },
    disabled: { type: 'boolean' },
    message: { type: 'string', maxLength: 200 },
    links: {
      type: 'object',
      required: ['actions'],
      properties: {
        actions: {
          type: 'array',
          minItems: 1,
        },
      },
    },
  },
  additionalProperties: true,
});

function validateActionGetResponse(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['response must be an object'] };
  }

  if (!['action', 'completed', 'message'].includes(payload.type)) {
    errors.push('type must be one of: action, completed, message');
  }

  if (!payload.icon) {
    errors.push('icon is required');
  }
  if (!payload.title) {
    errors.push('title is required');
  }
  if (!payload.description) {
    errors.push('description is required');
  }
  if (!payload.label) {
    errors.push('label is required');
  }
  if (!payload.links || !Array.isArray(payload.links.actions) || payload.links.actions.length === 0) {
    errors.push('links.actions must contain at least one action');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function buildActionGetResponse({
  icon,
  title,
  description,
  label,
  website,
  disabled,
  message,
  actions,
}) {
  return {
    type: 'action',
    icon,
    title,
    description,
    label,
    website: website || undefined,
    disabled: disabled || undefined,
    message: message || undefined,
    links: {
      actions: Array.isArray(actions) && actions.length > 0
        ? actions
        : [
            {
              type: 'transaction',
              label,
              href: website,
            },
          ],
    },
  };
}

module.exports = {
  ACTION_GET_RESPONSE_SCHEMA,
  validateActionGetResponse,
  buildActionGetResponse,
};