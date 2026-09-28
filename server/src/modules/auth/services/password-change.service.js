/**
 * Password Change Service
 *
 * @module signalforge/server/modules/auth/services/password-change
 */
const bcrypt = require('bcrypt');
const { LocalStrategy } = require('../strategies/local.strategy.js');
const { SessionService } = require('./session.service.js');
const { InvalidCredentialsError } = require('../auth.errors.js');
const { emitPasswordChanged } = require('../auth.events.js');
class PasswordChangeService {
  constructor(repository) {
    this.repository = repository;
    this.localStrategy = new LocalStrategy(repository);
    this.sessionService = new SessionService(repository);
  }

  async changePassword(userId, currentPassword, newPassword, currentSessionId = null) {
    const user = await this.repository.findUserById(userId);
    if (!user || !user.password_hash) {
      throw new InvalidCredentialsError();
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      throw new InvalidCredentialsError('Current password is incorrect');
    }

    const passwordHash = await this.localStrategy.hashPassword(newPassword);
    await this.repository.updatePassword(userId, passwordHash);

    await this.sessionService.revokeAllSessions(userId, currentSessionId, 'password_change');

    await emitPasswordChanged(userId);

    return { changed: true };
  }
}
module.exports = PasswordChangeService;
module.exports.PasswordChangeService = PasswordChangeService;
