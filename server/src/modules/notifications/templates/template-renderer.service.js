/**
 * Template Renderer Service
 *
 * Renders notification templates using simple mustache-style variable
 * substitution. Supports both HTML and text outputs and safely escapes
 * HTML in HTML templates.
 *
 * @module server/modules/notifications/templates/template-renderer.service
 */
const { AppError } = require('../../../lib/errors/app-error');
const { ERROR_CODES } = require('../../../lib/errors/error-codes');
const { logger } = require('../../../lib/logger');
const { escapeHtml } = require('@signalforge/shared/utils/string.util');
const { templateService } = require('./template.service');

const VARIABLE_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

function resolveVariable(path, data) {
  if (!path || !data) {
    return undefined;
  }

  const parts = path.split('.');
  let current = data;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

function renderText({ template, data }) {
  if (!template || typeof template !== 'string') {
    return '';
  }
  return template.replace(VARIABLE_PATTERN, (_, path) => {
    const value = resolveVariable(path, data);
    return value === undefined || value === null ? '' : String(value);
  });
}

function renderHtml({ template, data }) {
  if (!template || typeof template !== 'string') {
    return '';
  }
  return template.replace(VARIABLE_PATTERN, (_, path) => {
    const value = resolveVariable(path, data);
    if (value === undefined || value === null) {
      return '';
    }
    return escapeHtml(String(value));
  });
}
async function renderTemplate({ templateKey, channel, data = {}, locale = 'en' }) {
  if (!templateKey || !channel) {
    throw new AppError('templateKey and channel are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const template = await templateService.getTemplate({ templateKey, channel, locale });

  if (!template) {
    logger.debug({ templateKey, channel, locale }, 'Template not found, using fallback text');

    return {
      subject: null,
      text: data.text || '',
      html: data.html || null,
      fallback: true,
    };
  }

  const renderedSubject = template.subject ? renderText({ template: template.subject, data }) : null;
  const renderedText = template.body_text ? renderText({ template: template.body_text, data }) : '';
  const renderedHtml = template.body_html ? renderHtml({ template: template.body_html, data }) : null;

  return {
    subject: renderedSubject,
    text: renderedText,
    html: renderedHtml,
    fallback: false,
  };
}
async function renderInlineText({ templateText, data = {} }) {
  return renderText({ template: templateText, data });
}
async function renderInlineHtml({ templateHtml, data = {} }) {
  return renderHtml({ template: templateHtml, data });
}
const templateRendererService = {
  renderTemplate,
  renderInlineText,
  renderInlineHtml,
};
module.exports.templateRendererService = templateRendererService;

module.exports.renderTemplate = renderTemplate;

module.exports.renderInlineText = renderInlineText;

module.exports.renderInlineHtml = renderInlineHtml;
