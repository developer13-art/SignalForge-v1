/**
 * Register Service
 *
 * @module signalforge/server/modules/auth/services/register
 */

import { normalizeEmail } from '@signalforge/shared/validators/email.validator';
import { normalizePhone } from '@signalforge/shared/validators/phone.validator';
import { normalizeUsername } from '@signalforge/shared/validators/username.validator';

import { LocalStrategy } from '../strategies/local.strategy.js';
import {
  EmailAlreadyRegisteredError,
  UsernameAlreadyTakenError,
} from '../auth.errors.js';
import { DEFAULT_ROLE_ON_REGISTRATION } from '../auth.constants.js';
import { emitUserRegistered } from '../auth.events.js';

export class RegisterService {
  constructor(repository, emailVerificationService = null) {
    this.repository = repository;
    this.localStrategy = new LocalStrategy(repository);
    this.emailVerification = emailVerificationService;
  }

  async register(payload, meta = {}) {
    const email = normalizeEmail(payload.email);
    const phone = payload.phone ? normalizePhone(payload.phone) : null;
    const username = payload.username ? normalizeUsername(payload.username) : null;

    const existingEmail = await this.repository.findUserByEmail(email);
    if (existingEmail) {
      throw new EmailAlreadyRegisteredError();
    }

    if (username) {
      const existingUsername = await this.repository.findUserByUsername(username);
      if (existingUsername) {
        throw new UsernameAlreadyTakenError();
      }
    }

    if (phone) {
      const existingPhone = await this.repository.findUserByPhone(phone);
      if (existingPhone) {
        throw new EmailAlreadyRegisteredError('Phone number is already registered');
      }
    }

    const passwordHash = await this.localStrategy.hashPassword(payload.password);

    const user = await this.repository.createUser({
      email,
      phone,
      passwordHash,
      firstName: payload.firstName,
      middleName: payload.middleName || null,
      lastName: payload.lastName,
      username,
    });

    await this.repository.assignRoleToUser(user.id, DEFAULT_ROLE_ON_REGISTRATION);

    if (this.emailVerification) {
      await this.emailVerification.requestVerification(user.id, email);
    }

    await emitUserRegistered(user, {
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      referralCode: payload.referralCode || null,
    });

    return user;
  }
}

export default RegisterService;