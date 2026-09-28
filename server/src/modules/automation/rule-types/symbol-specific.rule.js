/**
 * Symbol-Specific Rule
 *
 * @module signalforge/server/modules/automation/rule-types/symbol-specific
 */
const { AUTOMATION_CONDITION_TYPES, AUTOMATION_ACTION_TYPES } = require('../automation.constants.js');
class SymbolSpecificRule {
  static supports(condition) {
    return [
      AUTOMATION_CONDITION_TYPES.SYMBOL_IS,
      AUTOMATION_CONDITION_TYPES.SYMBOL_IN,
    ].includes(condition?.type);
  }

  static defaultActions() {
    return [AUTOMATION_ACTION_TYPES.SKIP_SIGNAL];
  }
}
module.exports = SymbolSpecificRule;
module.exports.SymbolSpecificRule = SymbolSpecificRule;
