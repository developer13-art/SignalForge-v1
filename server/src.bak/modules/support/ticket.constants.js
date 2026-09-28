/**
 * Ticket Constants
 *
 * Shared constants used throughout the support ticket module.
 *
 * @module server/modules/support/ticket.constants
 */

export const TICKET_STATUSES = Object.freeze({
  OPEN: 'OPEN',
  PENDING_USER: 'PENDING_USER',
  PENDING_AGENT: 'PENDING_AGENT',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
});

export const TICKET_STATUS_VALUES = Object.freeze(Object.values(TICKET_STATUSES));

export const TICKET_PRIORITIES = Object.freeze({
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
});

export const TICKET_PRIORITY_VALUES = Object.freeze(Object.values(TICKET_PRIORITIES));

export const TICKET_CATEGORIES = Object.freeze({
  TRADING: 'TRADING',
  KYC: 'KYC',
  BILLING: 'BILLING',
  TECHNICAL: 'TECHNICAL',
  REFERRAL: 'REFERRAL',
  SECURITY: 'SECURITY',
  GENERAL: 'GENERAL',
});

export const TICKET_CATEGORY_VALUES = Object.freeze(Object.values(TICKET_CATEGORIES));

export const TICKET_SOURCES = Object.freeze({
  WEB: 'WEB',
  EMAIL: 'EMAIL',
  IN_APP: 'IN_APP',
  API: 'API',
});

export const TICKET_SOURCE_VALUES = Object.freeze(Object.values(TICKET_SOURCES));

export const TICKET_ACTORS = Object.freeze({
  USER: 'USER',
  AGENT: 'AGENT',
  SYSTEM: 'SYSTEM',
});

export const TICKET_ACTOR_VALUES = Object.freeze(Object.values(TICKET_ACTORS));

export const MAX_ATTACHMENTS_PER_MESSAGE = 10;

export const MAX_MESSAGE_LENGTH = 10000;

export const MAX_SUBJECT_LENGTH = 200;

export const SLA_RESPONSE_MINUTES = Object.freeze({
  LOW: 24 * 60,
  NORMAL: 8 * 60,
  HIGH: 4 * 60,
  URGENT: 60,
});

export const SLA_RESOLUTION_MINUTES = Object.freeze({
  LOW: 7 * 24 * 60,
  NORMAL: 3 * 24 * 60,
  HIGH: 24 * 60,
  URGENT: 8 * 60,
});

export function isValidTicketStatus(status) {
  return TICKET_STATUS_VALUES.includes(status);
}

export function isValidTicketPriority(priority) {
  return TICKET_PRIORITY_VALUES.includes(priority);
}

export function isValidTicketCategory(category) {
  return TICKET_CATEGORY_VALUES.includes(category);
}

export function getResponseSlaMinutes(priority) {
  return SLA_RESPONSE_MINUTES[priority] || SLA_RESPONSE_MINUTES.NORMAL;
}

export function getResolutionSlaMinutes(priority) {
  return SLA_RESOLUTION_MINUTES[priority] || SLA_RESOLUTION_MINUTES.NORMAL;
}