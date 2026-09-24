/**
 * Repository Helpers
 *
 * Reusable SQL fragments and utilities that repositories can use to
 * avoid repeating common patterns.
 *
 * @module server/database/repositories/repository.helpers
 */

export function buildWhereClause({ conditions, startIndex = 1 }) {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return { text: '', params: [] };
  }

  const params = [];
  const parts = [];

  for (const condition of conditions) {
    if (!condition || !condition.column || condition.value === undefined) {
      continue;
    }

    const placeholder = `$${startIndex + params.length}`;

    switch (condition.operator || '=') {
      case '=':
        parts.push(`${condition.column} = ${placeholder}`);
        params.push(condition.value);
        break;
      case '!=':
        parts.push(`${condition.column} != ${placeholder}`);
        params.push(condition.value);
        break;
      case '>':
        parts.push(`${condition.column} > ${placeholder}`);
        params.push(condition.value);
        break;
      case '>=':
        parts.push(`${condition.column} >= ${placeholder}`);
        params.push(condition.value);
        break;
      case '<':
        parts.push(`${condition.column} < ${placeholder}`);
        params.push(condition.value);
        break;
      case '<=':
        parts.push(`${condition.column} <= ${placeholder}`);
        params.push(condition.value);
        break;
      case 'ILIKE':
        parts.push(`${condition.column} ILIKE ${placeholder}`);
        params.push(`%${condition.value}%`);
        break;
      case 'IN':
        if (Array.isArray(condition.value) && condition.value.length > 0) {
          parts.push(`${condition.column} = ANY(${placeholder})`);
          params.push(condition.value);
        }
        break;
      case 'IS NULL':
        parts.push(`${condition.column} IS NULL`);
        break;
      case 'IS NOT NULL':
        parts.push(`${condition.column} IS NOT NULL`);
        break;
      default:
        break;
    }
  }

  if (parts.length === 0) {
    return { text: '', params: [] };
  }

  return { text: `WHERE ${parts.join(' AND ')}`, params };
}

export function buildOrderByClause({ orderBy, direction = 'ASC', allowedColumns = null }) {
  if (!orderBy) {
    return '';
  }

  if (Array.isArray(allowedColumns) && !allowedColumns.includes(orderBy)) {
    return '';
  }

  const dir = String(direction).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  return `ORDER BY ${orderBy} ${dir}`;
}

export function buildLimitOffsetClause({ limit = null, offset = null, paramStartIndex = 1 }) {
  const parts = [];
  const params = [];

  if (Number.isInteger(limit)) {
    parts.push(`LIMIT $${paramStartIndex + params.length}`);
    params.push(limit);
  }

  if (Number.isInteger(offset)) {
    parts.push(`OFFSET $${paramStartIndex + params.length}`);
    params.push(offset);
  }

  return { text: parts.join(' '), params };
}

export function buildInsertColumns({ data }) {
  const keys = Object.keys(data);
  const columns = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const values = keys.map((k) => data[k]);

  return {
    columns,
    placeholders,
    values,
  };
}

export function buildUpdateAssignments({ data, startIndex = 1 }) {
  const keys = Object.keys(data);
  const assignments = keys.map((k, i) => `${k} = $${startIndex + i}`).join(', ');
  const values = keys.map((k) => data[k]);

  return { assignments, values };
}

export const repositoryHelpers = {
  buildWhereClause,
  buildOrderByClause,
  buildLimitOffsetClause,
  buildInsertColumns,
  buildUpdateAssignments,
};