/**
 * Array Utilities
 *
 * @module server/utils/array.util
 */
function unique(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return Array.from(new Set(values));
}
function uniqueBy(values, key) {
  if (!Array.isArray(values)) {
    return [];
  }
  const seen = new Set();
  const result = [];
  for (const item of values) {
    const id = typeof key === 'function' ? key(item) : item[key];
    if (!seen.has(id)) {
      seen.add(id);
      result.push(item);
    }
  }
  return result;
}
function chunk(values, size) {
  if (!Array.isArray(values) || size < 1) {
    return [];
  }
  const chunks = [];
  for (let i = 0; i < values.length; i += size) {
    chunks.push(values.slice(i, i + size));
  }
  return chunks;
}
function groupBy(values, key) {
  if (!Array.isArray(values)) {
    return {};
  }
  return values.reduce((acc, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});
}
function sortBy(values, key, direction = 'asc') {
  if (!Array.isArray(values)) {
    return [];
  }
  const sorted = [...values].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];

    if (aVal === bVal) {
      return 0;
    }

    if (aVal < bVal) {
      return direction === 'asc' ? -1 : 1;
    }
    return direction === 'asc' ? 1 : -1;
  });
  return sorted;
}
function partition(values, predicate) {
  if (!Array.isArray(values)) {
    return [[], []];
  }
  const truthy = [];
  const falsy = [];
  for (const item of values) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  return [truthy, falsy];
}
function flatten(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.flat();
}
function compact(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.filter((v) => v !== null && v !== undefined);
}
function sumBy(values, key) {
  if (!Array.isArray(values)) {
    return 0;
  }
  return values.reduce((acc, item) => {
    const val = typeof key === 'function' ? key(item) : item[key];
    const num = Number(val);
    return acc + (Number.isFinite(num) ? num : 0);
  }, 0);
}
const arrayUtil = {
  unique,
  uniqueBy,
  chunk,
  groupBy,
  sortBy,
  partition,
  flatten,
  compact,
  sumBy,
};
module.exports.arrayUtil = arrayUtil;
module.exports.unique = unique;
module.exports.uniqueBy = uniqueBy;
module.exports.chunk = chunk;
module.exports.groupBy = groupBy;
module.exports.sortBy = sortBy;
module.exports.partition = partition;
module.exports.flatten = flatten;
module.exports.compact = compact;
module.exports.sumBy = sumBy;
