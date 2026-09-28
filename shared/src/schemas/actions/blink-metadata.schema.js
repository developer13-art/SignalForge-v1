'use strict';

const { MIME_TYPES } = require('../../constants/solana-actions/actions-mime-types');

/**
 * SignalForge - Blink Metadata Schema
 *
 * JSDoc-typed schema (no runtime dependency) used by the client to
 * validate the shape of Blink metadata before rendering it and by the
 * server to assert what it will send.
 */

const BLINK_METADATA_SCHEMA = Object.freeze({
  type: 'object',
  required: ['icon', 'title', 'description', 'label', 'links'],
  properties: {
    type: { type: 'string', enum: ['action'] },
    icon: { type: 'string', format: 'uri' },
    title: { type: 'string', minLength: 1, maxLength: 80 },
    description: { type: 'string', minLength: 1, maxLength: 300 },
    label: { type: 'string', minLength: 1, maxLength: 40 },
    disabled: { type: 'boolean' },
    message: { type: 'string', maxLength: 200 },
    website: { type: 'string', format: 'uri' },
    links: {
      type: 'object',
      required: ['actions'],
      properties: {
        actions: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['type', 'label', 'href'],
            properties: {
              type: { type: 'string', enum: ['transaction', 'message', 'external-link'] },
              label: { type: 'string', minLength: 1, maxLength: 40 },
              href: { type: 'string', format: 'uri' },
              parameters: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'label'],
                  properties: {
                    name: { type: 'string' },
                    label: { type: 'string' },
                    required: { type: 'boolean' },
                    type: {
                      type: 'string',
                      enum: ['text', 'email', 'url', 'number', 'date', 'textarea', 'select', 'radio', 'checkbox'],
                    },
                    pattern: { type: 'string' },
                    patternDescription: { type: 'string' },
                    min: { type: 'number' },
                    max: { type: 'number' },
                    options: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['label', 'value'],
                        properties: {
                          label: { type: 'string' },
                          value: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  additionalProperties: false,
});

function validateBlinkMetadata(metadata) {
  const errors = [];

  if (!metadata || typeof metadata !== 'object') {
    return { valid: false, errors: ['metadata must be an object'] };
  }

  if (metadata.type !== 'action') {
    errors.push('metadata.type must be "action"');
  }

  if (!metadata.icon || typeof metadata.icon !== 'string') {
    errors.push('metadata.icon is required');
  }

  if (!metadata.title || typeof metadata.title !== 'string' || metadata.title.length > 80) {
    errors.push('metadata.title must be a non-empty string of at most 80 characters');
  }

  if (
    !metadata.description ||
    typeof metadata.description !== 'string' ||
    metadata.description.length > 300
  ) {
    errors.push('metadata.description must be a non-empty string of at most 300 characters');
  }

  if (!metadata.label || typeof metadata.label !== 'string' || metadata.label.length > 40) {
    errors.push('metadata.label must be a non-empty string of at most 40 characters');
  }

  if (!metadata.links || typeof metadata.links !== 'object') {
    errors.push('metadata.links is required');
  } else if (!Array.isArray(metadata.links.actions) || metadata.links.actions.length === 0) {
    errors.push('metadata.links.actions must contain at least one action');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function buildBlinkMetadata({ icon, title, description, label, website, disabled, message, href }) {
  return {
    type: 'action',
    icon,
    title: title.slice(0, 80),
    description: description.slice(0, 300),
    label: label.slice(0, 40),
    website: website || undefined,
    disabled: disabled || undefined,
    message: message ? message.slice(0, 200) : undefined,
    links: {
      actions: [
        {
          type: 'transaction',
          label: label.slice(0, 40),
          href,
        },
      ],
    },
  };
}

const BLINK_METADATA_CONTENT_TYPE = MIME_TYPES.JSON;

module.exports = {
  BLINK_METADATA_SCHEMA,
  validateBlinkMetadata,
  buildBlinkMetadata,
  BLINK_METADATA_CONTENT_TYPE,
};