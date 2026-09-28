/**
 * Ticket Constants
 *
 * Shared constants used throughout the support ticket module.
 *
 * @module server/modules/support/ticket.constants
 */
const TICKET_STATUSES = Object.freeze({
  OPEN: 'OPEN',
  PENDING_USER: 'PENDING_USER',
  PENDING_AGENT: 'PENDING_AGENT',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
});
const TICKET_STATUS_VALUES = Object.freeze(Object.values(TICKET_STATUSES));
const TICKET_PRIORITIES = Object.freeze({
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
});
const TICKET_PRIORITY_VALUES = Object.freeze(Object.values(TICKET_PRIORITIES));
const TICKET_CATEGORIES = Object.freeze({
  TRADING: 'TRADING',
  KYC: 'KYC',
  BILLING: 'BILLING',
  TECHNICAL: 'TECHNICAL',
  REFERRAL: 'REFERRAL',
  SECURITY: 'SECURITY',
  GENERAL: 'GENERAL',
});
const TICKET_CATEGORY_VALUES = Object.freeze(Object.values(TICKET_CATEGORIES));
const TICKET_SOURCES = Object.freeze({
  WEB: 'WEB',
  EMAIL: 'EMAIL',
  IN_APP: 'IN_APP',
  API: 'API',
});
const TICKET_SOURCE_VALUES = Object.freeze(Object.values(TICKET_SOURCES));
const TICKET_ACTORS = Object.freeze({
  USER: 'USER',
  AGENT: 'AGENT',
  SYSTEM: 'SYSTEM',
});
const TICKET_ACTOR_VALUES = Object.freeze(Object.values(TICKET_ACTORS));
const MAX_ATTACHMENTS_PER_MESSAGE = 10;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_SUBJECT_LENGTH = 200;
const SLA_RESPONSE_MINUTES = Object.freeze({
  LOW: 24 * 60,
  NORMAL: 8 * 60,
  HIGH: 4 * 60,
  URGENT: 60,
});
const SLA_RESOLUTION_MINUTES = Object.freeze({
  LOW: 7 * 24 * 60,
  NORMAL: 3 * 24 * 60,
  HIGH: 24 * 60,
  URGENT: 8 * 60,
});
function isValidTicketStatus(status) {
  return TICKET_STATUS_VALUES.includes(status);
}
function isValidTicketPriority(priority) {
  return TICKET_PRIORITY_VALUES.includes(priority);
}
function isValidTicketCategory(category) {
  return TICKET_CATEGORY_VALUES.includes(category);
}
function getResponseSlaMinutes(priority) {
  return SLA_RESPONSE_MINUTES[priority] || SLA_RESPONSE_MINUTES.NORMAL;
}
function getResolutionSlaMinutes(priority) {
  return SLA_RESOLUTION_MINUTES[priority] || SLA_RESOLUTION_MINUTES.NORMAL;
}
module.exports.TICKET_STATUSES = TICKET_STATUSES;
module.exports.TICKET_STATUS_VALUES = TICKET_STATUS_VALUES;
module.exports.TICKET_PRIORITIES = TICKET_PRIORITIES;
module.exports.TICKET_PRIORITY_VALUES = TICKET_PRIORITY_VALUES;
module.exports.TICKET_CATEGORIES = TICKET_CATEGORIES;
module.exports.TICKET_CATEGORY_VALUES = TICKET_CATEGORY_VALUES;
module.exports.TICKET_SOURCES = TICKET_SOURCES;
module.exports.TICKET_SOURCE_VALUES = TICKET_SOURCE_VALUES;
module.exports.TICKET_ACTORS = TICKET_ACTORS;
module.exports.TICKET_ACTOR_VALUES = TICKET_ACTOR_VALUES;
module.exports.MAX_ATTACHMENTS_PER_MESSAGE = MAX_ATTACHMENTS_PER_MESSAGE;
module.exports.MAX_MESSAGE_LENGTH = MAX_MESSAGE_LENGTH;
module.exports.MAX_SUBJECT_LENGTH = MAX_SUBJECT_LENGTH;
module.exports.SLA_RESPONSE_MINUTES = SLA_RESPONSE_MINUTES;
module.exports.SLA_RESOLUTION_MINUTES = SLA_RESOLUTION_MINUTES;
module.exports.isValidTicketStatus = isValidTicketStatus;
module.exports.isValidTicketPriority = isValidTicketPriority;
module.exports.isValidTicketCategory = isValidTicketCategory;
module.exports.getResponseSlaMinutes = getResponseSlaMinutes;
module.exports.getResolutionSlaMinutes = getResolutionSlaMinutes;
