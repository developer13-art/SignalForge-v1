/**
 * Query Builder
 *
 * A minimal, safe SQL builder that supports named parameters,
 * conditional clauses, ordering, and pagination. Values are always
 * bound, never interpolated.
 *
 * @module server/database/query-builder
 */

import { getPool } from './connection';

export class QueryBuilder {
  constructor(table) {
    if (!table) {
      throw new Error('table is required');
    }
    this._table = table;
    this._select = ['*'];
    this._where = [];
    this._params = [];
    this._order = [];
    this._limit = null;
    this._offset = null;
    this._joins = [];
    this._group = [];
    this._having = [];
  }

  select(columns) {
    this._select = Array.isArray(columns) ? columns : [columns];
    return this;
  }

  where(clause, ...values) {
    if (!clause) {
      return this;
    }

    let boundClause = clause;
    for (const value of values) {
      this._params.push(value);
      boundClause = boundClause.replace('?', `$${this._params.length}`);
    }

    this._where.push(boundClause);
    return this;
  }

  whereIf(condition, clause, ...values) {
    if (condition) {
      this.where(clause, ...values);
    }
    return this;
  }

  join(joinClause) {
    if (joinClause) {
      this._joins.push(joinClause);
    }
    return this;
  }

  groupBy(columns) {
    const list = Array.isArray(columns) ? columns : [columns];
    this._group.push(...list);
    return this;
  }

  having(clause, ...values) {
    if (!clause) {
      return this;
    }

    let boundClause = clause;
    for (const value of values) {
      this._params.push(value);
      boundClause = boundClause.replace('?', `$${this._params.length}`);
    }

    this._having.push(boundClause);
    return this;
  }

  orderBy(column, direction = 'ASC') {
    const dir = String(direction).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    this._order.push(`${column} ${dir}`);
    return this;
  }

  limit(value) {
    this._limit = Number(value);
    return this;
  }

  offset(value) {
    this._offset = Number(value);
    return this;
  }

  build() {
    const parts = [`SELECT ${this._select.join(', ')} FROM ${this._table}`];

    if (this._joins.length > 0) {
      parts.push(this._joins.join(' '));
    }

    if (this._where.length > 0) {
      parts.push(`WHERE ${this._where.join(' AND ')}`);
    }

    if (this._group.length > 0) {
      parts.push(`GROUP BY ${this._group.join(', ')}`);
    }

    if (this._having.length > 0) {
      parts.push(`HAVING ${this._having.join(' AND ')}`);
    }

    if (this._order.length > 0) {
      parts.push(`ORDER BY ${this._order.join(', ')}`);
    }

    if (this._limit !== null) {
      parts.push(`LIMIT ${this._limit}`);
    }

    if (this._offset !== null) {
      parts.push(`OFFSET ${this._offset}`);
    }

    return { text: parts.join(' '), params: this._params };
  }

  async execute(client = null) {
    const { text, params } = this.build();
    const connection = client || getPool();
    return connection.query(text, params);
  }
}

export function createBuilder(table) {
  return new QueryBuilder(table);
}

export function query(text, params = []) {
  const pool = getPool();
  return pool.query(text, params);
}

export const queryBuilder = {
  QueryBuilder,
  createBuilder,
  query,
};