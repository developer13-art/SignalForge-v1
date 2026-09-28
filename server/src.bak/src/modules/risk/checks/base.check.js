/**
 * Base Risk Check
 *
 * @module signalforge/server/modules/risk/checks/base
 */
const { RISK_CHECKS } = require('../risk.constants.js');

export class BaseCheck {
  constructor(name) {
    this.name = name || RISK_CHECKS.MAX_DAILY_LOSS;
  }

  async run(context) {
    throw new Error(`${this.name} must implement run()`);
  }

  pass(details = null) {
    return {
      name: this.name,
      passed: true,
      details,
    };
  }

  fail(reason, details = null) {
    return {
      name: this.name,
      passed: false,
      reason,
      details,
    };
  }

  skip(reason = 'SKIPPED') {
    return {
      name: this.name,
      passed: true,
      skipped: true,
      reason,
    };
  }
}
module.exports = BaseCheck;