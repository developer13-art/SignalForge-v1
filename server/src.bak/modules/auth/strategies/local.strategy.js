/**
 * Local Strategy
 *
 * Provides password-based authentication. Verifies the password
 * against the stored hash and returns the authenticated user.
 *
 * @module signalforge/server/modules/auth/strategies/local
 */

import bcrypt from 'bcrypt';

import { InvalidCredentialsError } from '../auth.errors.js';

export class LocalStrategy {
  constructor(repository) {
    this.repository = repository;
  }

  async authenticate(email, password) {
    if (!email || !password) {
      throw new InvalidCredentialsError();
    }

    const user = await this.repository.findUserByEmail(email);

    if (!user || !user.password_hash) {
      throw new InvalidCredentialsError();
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      throw new InvalidCredentialsError();
    }

    return user;
  }

  async hashPassword(password) {
    const rounds = Number(process.env.HASH_SALT_ROUNDS) || 12;
    return bcrypt.hash(password, rounds);
  }

  async verifyPassword(password, hash) {
    if (!password || !hash) {
      return false;
    }
    return bcrypt.compare(password, hash);
  }
}

export default LocalStrategy;