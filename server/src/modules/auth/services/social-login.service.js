/**
 * Social Login Service
 *
 * Provides authentication via third-party identity providers.
 * Provider-specific verification is delegated to injected
 * verification functions so that this service stays decoupled.
 *
 * @module signalforge/server/modules/auth/services/social-login
 */

import { normalizeEmail } from '@signalforge/shared/validators/email.validator';

import { LoginService } from './login.service.js';
import { DEFAULT_ROLE_ON_REGISTRATION } from '../auth.constants.js';
import { InvalidTokenError } from '../auth.errors.js';
import { emitUserRegistered } from '../auth.events.js';

export class SocialLoginService {
  constructor(repository, options = {}) {
    this.repository = repository;
    this.loginService = new LoginService(repository);
    this.verifiers = options.verifiers || {};
  }

  registerVerifier(provider, verifier) {
    if (typeof verifier !== 'function') {
      throw new Error('Verifier must be a function');
    }
    this.verifiers[provider] = verifier;
  }

  async verifyProviderToken(provider, token) {
    const verifier = this.verifiers[provider];
    if (!verifier) {
      throw new InvalidTokenError(`No verifier registered for provider ${provider}`);
    }
    return verifier(token);
  }

  async authenticate(provider, token, req) {
    const profile = await this.verifyProviderToken(provider, token);

    if (!profile || !profile.email) {
      throw new InvalidTokenError('Provider did not return a valid email');
    }

    const email = normalizeEmail(profile.email);

    let user = await this.repository.findUserByEmail(email);

    if (!user) {
      const userCreate = await this.repository.createUser({
        email,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        username: null,
        passwordHash: null,
        status: 'ACTIVE',
      });

      await this.repository.assignRoleToUser(userCreate.id, DEFAULT_ROLE_ON_REGISTRATION);
      await this.repository.markEmailVerified(userCreate.id);

      await emitUserRegistered(userCreate, {
        provider,
        ipAddress: req.ip,
      });

      user = await this.repository.findUserById(userCreate.id);
    }

    return this.loginService.completeLogin(user, req);
  }
}

export default SocialLoginService;