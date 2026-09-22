/**
 * User Service
 *
 * @module signalforge/server/modules/users/service
 */

import { UserRepository } from './user.repository.js';
import { ProfileService } from './profile/profile.service.js';
import { PreferencesService } from './preferences/preferences.service.js';
import { SessionService } from './sessions/session.service.js';
import { DeviceService } from './devices/device.service.js';
import { normalizeEmail } from '@signalforge/shared/validators/email.validator';
import { normalizePhone } from '@signalforge/shared/validators/phone.validator';
import { normalizeUsername } from '@signalforge/shared/validators/username.validator';
import {
  UserNotFoundError,
  UsernameAlreadyTakenError,
  EmailAlreadyRegisteredError,
  PhoneAlreadyRegisteredError,
  AccountAlreadyDeactivatedError,
  AccountNotDeactivatedError,
} from './user.errors.js';
import {
  emitUserUpdated,
  emitAccountDeactivated,
  emitAccountReactivated,
} from './user.events.js';

export class UserService {
  constructor(repository = null, dependencies = {}) {
    this.repository = repository || new UserRepository();
    this.profileService = dependencies.profileService || new ProfileService();
    this.preferencesService = dependencies.preferencesService || new PreferencesService();
    this.sessionService = dependencies.sessionService || new SessionService();
    this.deviceService = dependencies.deviceService || new DeviceService();
  }

  async getById(userId) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return this.serialize(user);
  }

  async getByIdWithRoles(userId) {
    const user = await this.repository.findByIdWithRoles(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return this.serialize(user, { includeRoles: true });
  }

  async getByEmail(email) {
    const normalized = normalizeEmail(email);
    return this.repository.findByEmail(normalized);
  }

  async update(userId, payload) {
    const existing = await this.repository.findById(userId);
    if (!existing) {
      throw new UserNotFoundError();
    }

    const changes = {};

    if (payload.email !== undefined) {
      const email = normalizeEmail(payload.email);
      if (email && email !== existing.email) {
        const taken = await this.repository.existsByEmail(email, userId);
        if (taken) {
          throw new EmailAlreadyRegisteredError();
        }
        changes.email = email;
      }
    }

    if (payload.phone !== undefined && payload.phone !== null) {
      const phone = normalizePhone(payload.phone);
      if (phone && phone !== existing.phone) {
        const taken = await this.repository.existsByPhone(phone, userId);
        if (taken) {
          throw new PhoneAlreadyRegisteredError();
        }
        changes.phone = phone;
      }
    }

    if (payload.username !== undefined && payload.username !== null) {
      const username = normalizeUsername(payload.username);
      if (username && username !== existing.username) {
        const taken = await this.repository.existsByUsername(username, userId);
        if (taken) {
          throw new UsernameAlreadyTakenError();
        }
        changes.username = username;
      }
    }

    if (payload.firstName !== undefined) changes.firstName = payload.firstName;
    if (payload.middleName !== undefined) changes.middleName = payload.middleName;
    if (payload.lastName !== undefined) changes.lastName = payload.lastName;

    if (Object.keys(changes).length === 0) {
      return this.serialize(existing);
    }

    const updated = await this.repository.update(userId, changes);

    await emitUserUpdated(userId, Object.keys(changes));

    return this.serialize(updated);
  }

  async deactivate(userId, actorId = null) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status === 'DEACTIVATED') {
      throw new AccountAlreadyDeactivatedError();
    }
    await this.repository.deactivate(userId);
    await this.sessionService.revokeAll(userId, null, 'account_deactivated');
    await emitAccountDeactivated(userId, { actorId });
    return { deactivated: true };
  }

  async reactivate(userId, actorId = null) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status !== 'DEACTIVATED') {
      throw new AccountNotDeactivatedError();
    }
    await this.repository.reactivate(userId);
    await emitAccountReactivated(userId, { actorId });
    return { reactivated: true };
  }

  async softDelete(userId) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    await this.sessionService.revokeAll(userId, null, 'account_deleted');
    await this.repository.softDelete(userId);
    return { deleted: true };
  }

  async list(filters = {}, pagination = {}) {
    const result = await this.repository.list(filters, pagination);
    return {
      users: result.users.map((u) => this.serialize(u)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getStats() {
    const [statusCounts, kycCounts, total] = await Promise.all([
      this.repository.countByStatus(),
      this.repository.countByKycStatus(),
      this.repository.countTotal(),
    ]);
    return { total, byStatus: statusCounts, byKycStatus: kycCounts };
  }

  serialize(row, options = {}) {
    if (!row) {
      return null;
    }
    const result = {
      id: row.id,
      email: row.email,
      phone: row.phone,
      firstName: row.first_name,
      middleName: row.middle_name,
      lastName: row.last_name,
      username: row.username,
      avatarUrl: row.avatar_url,
      status: row.status,
      kycStatus: row.kyc_status,
      accountType: row.account_type,
      emailVerified: Boolean(row.email_verified_at),
      phoneVerified: Boolean(row.phone_verified_at),
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    if (options.includeRoles && row.roles) {
      result.roles = row.roles;
    }
    return result;
  }
}

export default UserService;