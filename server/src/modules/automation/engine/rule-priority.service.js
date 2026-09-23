/**
 * Rule Priority Service
 *
 * @module signalforge/server/modules/automation/engine/rule-priority
 */

export class RulePriorityService {
  sort(rules) {
    if (!Array.isArray(rules)) {
      return [];
    }
    return [...rules].sort((a, b) => {
      const pa = Number(a.priority || 100);
      const pb = Number(b.priority || 100);
      if (pa !== pb) {
        return pb - pa;
      }
      const ca = new Date(a.created_at || 0).getTime();
      const cb = new Date(b.created_at || 0).getTime();
      return ca - cb;
    });
  }

  filterByScope(rules, context) {
    if (!Array.isArray(rules)) {
      return [];
    }
    return rules.filter((rule) => {
      if (rule.scope === 'GLOBAL') {
        return true;
      }
      if (rule.scope === 'PROVIDER') {
        return rule.provider_id === context.providerId;
      }
      if (rule.scope === 'SYMBOL') {
        return rule.symbol === context.symbol;
      }
      return true;
    });
  }
}

export default RulePriorityService;