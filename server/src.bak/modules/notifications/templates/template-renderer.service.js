/**
 * Template Renderer Service
 *
 * Renders notification templates using simple mustache-style variable
 * substitution. Supports both HTML and text outputs and safely escapes
 * HTML in HTML templates.
 *
 * @module server/modules/notifications/templates/template-renderer.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { escapeHtml } from '@signalforge/shared/utils/string.util';
import { templateService } from './template.service';

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

export async function renderTemplate({ templateKey, channel, data = {}, locale = 'en' }) {
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

export async function renderInlineText({ templateText, data = {} }) {
  return renderText({ template: templateText, data });
}

export async function renderInlineHtml({ templateHtml, data = {} }) {
  return renderHtml({ template: templateHtml, data });
}

export const templateRendererService = {
  renderTemplate,
  renderInlineText,
  renderInlineHtml,
};