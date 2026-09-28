/**
 * Job Statuses
 *
 * Defines the lifecycle states of a background job in the SignalForge
 * job queue.
 *
 * @module @signalforge/shared/constants/job-statuses
 */const JOB_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING',
  DEAD_LETTER: 'DEAD_LETTER',
  CANCELLED: 'CANCELLED',
});const JOB_STATUS_VALUES = Object.freeze(Object.values(JOB_STATUSES));const JOB_STATUS_LABELS = Object.freeze({
  [JOB_STATUSES.PENDING]: 'Pending',
  [JOB_STATUSES.SCHEDULED]: 'Scheduled',
  [JOB_STATUSES.RUNNING]: 'Running',
  [JOB_STATUSES.COMPLETED]: 'Completed',
  [JOB_STATUSES.FAILED]: 'Failed',
  [JOB_STATUSES.RETRYING]: 'Retrying',
  [JOB_STATUSES.DEAD_LETTER]: 'Dead Letter',
  [JOB_STATUSES.CANCELLED]: 'Cancelled',
});const TERMINAL_JOB_STATUSES = Object.freeze([
  JOB_STATUSES.COMPLETED,
  JOB_STATUSES.FAILED,
  JOB_STATUSES.DEAD_LETTER,
  JOB_STATUSES.CANCELLED,
]);const PROCESSABLE_JOB_STATUSES = Object.freeze([
  JOB_STATUSES.PENDING,
  JOB_STATUSES.SCHEDULED,
  JOB_STATUSES.RETRYING,
]);const DEFAULT_MAX_JOB_ATTEMPTS = 3;function isTerminalJobStatus(status) {
  return TERMINAL_JOB_STATUSES.includes(status);
}function isProcessableJobStatus(status) {
  return PROCESSABLE_JOB_STATUSES.includes(status);
}function isValidJobStatus(status) {
  return JOB_STATUS_VALUES.includes(status);
}

module.exports.isTerminalJobStatus = isTerminalJobStatus;
module.exports.isProcessableJobStatus = isProcessableJobStatus;
module.exports.isValidJobStatus = isValidJobStatus;
module.exports.JOB_STATUSES = JOB_STATUSES;
module.exports.JOB_STATUS_VALUES = JOB_STATUS_VALUES;
module.exports.JOB_STATUS_LABELS = JOB_STATUS_LABELS;
module.exports.TERMINAL_JOB_STATUSES = TERMINAL_JOB_STATUSES;
module.exports.PROCESSABLE_JOB_STATUSES = PROCESSABLE_JOB_STATUSES;
module.exports.DEFAULT_MAX_JOB_ATTEMPTS = DEFAULT_MAX_JOB_ATTEMPTS;
