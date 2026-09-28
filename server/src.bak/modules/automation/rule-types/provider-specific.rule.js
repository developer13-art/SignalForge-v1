/**
 * Provider-Specific Rule
 *
 * @module signalforge/server/modules/automation/rule-types/provider-specific
 */

import { AUTOMATION_CONDITION_TYPES, AUTOMATION_ACTION_TYPES } from '../automation.constants.js';

export class ProviderSpecificRule {
  static supports(condition) {
    return [
      AUTOMATION_CONDITION_TYPES.PROVIDER_IS,
      AUTOMATION_CONDITION_TYPES.PROVIDER_CLOSES,
    ].includes(condition?.type);
  }

  static defaultActions() {
    return [AUTOMATION_ACTION_TYPES.SKIP_SIGNAL];
  }
}

export default ProviderSpecificRule;