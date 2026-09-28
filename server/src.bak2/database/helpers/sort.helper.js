/**
 * Sort Helper
 *
 * Converts request sort parameters into safe ORDER BY clauses.
 *
 * @module server/database/helpers/sort.helper
 */

const ALLOWED_DIRECTIONS = ['ASC', 'DESC'];
function buildSortClause({ sortBy, sortDir = 'DESC', allowedColumns }) {
  if (!sortBy || !Array.isArray(allowedColumns) || !allowedColumns.includes(sortBy)) {
    return '';
  }

  const direction = ALLOWED_DIRECTIONS.includes(String(sortDir).toUpperCase())
    ? String(sortDir).toUpperCase()
    : 'DESC';

  return `ORDER BY ${sortBy} ${direction}`;
}
function buildMultiSortClause({ sorts, allowedColumns }) {
  if (!Array.isArray(sorts) || sorts.length === 0) {
    return '';
  }

  const valid = sorts
    .filter((s) => s && s.column && Array.isArray(allowedColumns) && allowedColumns.includes(s.column))
    .map((s) => {
      const dir = ALLOWED_DIRECTIONS.includes(String(s.direction || 'ASC').toUpperCase())
        ? String(s.direction || 'ASC').toUpperCase()
        : 'ASC';
      return `${s.column} ${dir}`;
    });

  if (valid.length === 0) {
    return '';
  }

  return `ORDER BY ${valid.join(', ')}`;
}
const sortHelper = {
  buildSortClause,
  buildMultiSortClause,
  ALLOWED_DIRECTIONS,
};
module.exports.sortHelper = sortHelper;
module.exports.buildSortClause = buildSortClause;
module.exports.buildMultiSortClause = buildMultiSortClause;
