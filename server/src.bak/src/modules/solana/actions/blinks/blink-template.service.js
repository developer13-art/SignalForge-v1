'use strict';

const crypto = require('crypto');

const blinkTemplateRepository = require('./blink-template.repository');
const blinkValidator = require('./blink.validator');

const { BLINK_TEMPLATE_DEFINITIONS } = require('./blink.constants');
const { NotFoundError, InvalidParameterError } = require('../actions.errors');

const { config } = require('../actions.config');
const actionsValidator = require('../actions.validator');

/**
 * SignalForge - Blink Template Service
 *
 * Templates allow providers and owners to save reusable Blink
 * configurations. Instantiation copies the template into a real,
 * active Blink record.
 */

function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function pickTemplateFields(payload, templateType) {
  const definition = BLINK_TEMPLATE_DEFINITIONS[templateType];
  if (!definition) {
    throw new InvalidParameterError(`Unknown template type: ${templateType}`);
  }

  const tokenSymbol = payload.tokenSymbol || config.token.defaultSymbol;
  const tokenMint = payload.tokenMint
    ? actionsValidator.validateTokenMint(payload.tokenMint)
    : actionsValidator.resolveMintForSymbol(tokenSymbol, config.network);

  return {
    templateType,
    name: payload.name || `${definition.name} - ${new Date().toISOString().slice(0, 10)}`,
    title: payload.title || definition.defaultTitle,
    description: payload.description || definition.defaultDescription,
    label: payload.label || definition.defaultLabel,
    message: payload.message || '',
    iconUrl: payload.iconUrl || null,
    website: payload.website || null,
    planId: payload.planId || null,
    referralCode: payload.referralCode || null,
    tokenSymbol,
    tokenMint,
    amount: payload.amount,
    amountDecimals: payload.amountDecimals,
    metadata: payload.metadata || {},
  };
}

async function createTemplate({ ownerUserId, providerId, payload }) {
  const validated = blinkValidator.validateCreateBlinkPayload(payload);
  const templateType = validated.templateType;

  const fields = pickTemplateFields(
    {
      ...payload,
      ...validated,
    },
    templateType,
  );

  const template = await blinkTemplateRepository.createTemplate(null, {
    id: generateId('tmpl'),
    ownerUserId: ownerUserId || null,
    providerId: providerId || null,
    ...fields,
  });

  return template;
}

async function getTemplate(templateId) {
  const template = await blinkTemplateRepository.findById(templateId);
  if (!template) {
    throw new NotFoundError(`Blink template ${templateId} was not found`);
  }
  return template;
}

async function listTemplates(filters) {
  return blinkTemplateRepository.list(filters);
}

async function updateTemplate(templateId, payload) {
  const existing = await blinkTemplateRepository.findById(templateId);
  if (!existing) {
    throw new NotFoundError(`Blink template ${templateId} was not found`);
  }

  const validated = blinkValidator.validateUpdateBlinkPayload(payload);
  const updated = await blinkTemplateRepository.update(templateId, validated);
  return updated;
}

async function deleteTemplate(templateId) {
  const existing = await blinkTemplateRepository.findById(templateId);
  if (!existing) {
    throw new NotFoundError(`Blink template ${templateId} was not found`);
  }
  return blinkTemplateRepository.remove(templateId);
}

async function findTemplateByName({ ownerUserId, providerId, name }) {
  return blinkTemplateRepository.findByName({ ownerUserId, providerId, name });
}

async function countOwnerTemplates(ownerUserId) {
  if (!ownerUserId) {
    throw new InvalidParameterError('ownerUserId is required');
  }
  return blinkTemplateRepository.countByOwner(ownerUserId);
}

module.exports = {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  findTemplateByName,
  countOwnerTemplates,
};