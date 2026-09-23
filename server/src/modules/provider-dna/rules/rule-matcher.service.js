/**
 * Rule Matcher Service
 *
 * @module signalforge/server/modules/provider-dna/rules/matcher
 */

export class RuleMatcherService {
  matchRule(rule, text) {
    if (!rule || !text) {
      return false;
    }

    const haystack = rule.case_sensitive ? text : text.toLowerCase();
    const needle = rule.case_sensitive ? rule.pattern : rule.pattern.toLowerCase();

    switch (rule.match_type || rule.matchType) {
      case 'EXACT':
        return haystack === needle;
      case 'CONTAINS':
        return haystack.includes(needle);
      case 'STARTS_WITH':
        return haystack.startsWith(needle);
      case 'ENDS_WITH':
        return haystack.endsWith(needle);
      case 'REGEX': {
        try {
          const flags = rule.case_sensitive ? '' : 'i';
          return new RegExp(rule.pattern, flags).test(text);
        } catch {
          return false;
        }
      }
      default:
        return false;
    }
  }

  matchRules(rules, text) {
    if (!Array.isArray(rules)) {
      return [];
    }
    return rules.filter((rule) => this.matchRule(rule, text));
  }

  sortByPriority(rules) {
    return [...rules].sort((a, b) => {
      const priorityDelta = (b.priority || 0) - (a.priority || 0);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return (b.confidence || 0) - (a.confidence || 0);
    });
  }
}

export default RuleMatcherService;