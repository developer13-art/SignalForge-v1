/**
 * Plan Validator
 *
 * @module signalforge/server/modules/subscriptions/plans/validator
 */
const { validatePlanCreatePayload, validatePlanUpdatePayload } = require('../subscription.validator.js');
function validateCreatePlan(body) {
  return validatePlanCreatePayload(body);
}
function validateUpdatePlan(body) {
  return validatePlanUpdatePayload(body);
}
module.exports.validateCreatePlan = validateCreatePlan;
module.exports.validateUpdatePlan = validateUpdatePlan;
