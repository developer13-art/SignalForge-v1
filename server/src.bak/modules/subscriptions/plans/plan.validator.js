/**
 * Plan Validator
 *
 * @module signalforge/server/modules/subscriptions/plans/validator
 */

import {
  validatePlanCreatePayload,
  validatePlanUpdatePayload,
} from '../subscription.validator.js';

export function validateCreatePlan(body) {
  return validatePlanCreatePayload(body);
}

export function validateUpdatePlan(body) {
  return validatePlanUpdatePayload(body);
}