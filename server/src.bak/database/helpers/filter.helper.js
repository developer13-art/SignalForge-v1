/**
 * Filter Helper
 *
 * Converts request query filters into safe SQL condition arrays.
 *
 * @module server/database/helpers/filter.helper
 */

const OPERATORS = Object.freeze({
  eq: '=',
  ne: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  like: 'ILIKE',
  in: 'IN',
});

export function buildFilterConditions({ filters, columnMap }) {
  if (!filters || typeof filters !== 'object' || !columnMap) {
    return [];
  }

  const conditions = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    const spec = columnMap[key];

    if (!spec) {
      continue;
    }

    const column = typeof spec === 'string' ? spec : spec.column;
    const operatorKey = typeof spec === 'object' && spec.operator ? spec.operator : 'eq';
    const operator = OPERATORS[operatorKey] || '=';

    if (operator === 'IN') {
      if (Array.isArray(value) && value.length > 0) {
        conditions.push({ column, operator: 'IN', value });
      }
      continue;
    }

    if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
      conditions.push({ column, operator });
      continue;
    }

    conditions.push({ column, operator, value });
  }

  return conditions;
}

export function buildDateRangeConditions({ column, from, to }) {
  const conditions = [];

  if (from) {
    conditions.push({ column, operator: '>=', value: from });
  }

  if (to) {
    conditions.push({ column, operator: '<=', value: to });
  }

  return conditions;
}

export const filterHelper = {
  buildFilterConditions,
  buildDateRangeConditions,
  OPERATORS,
};