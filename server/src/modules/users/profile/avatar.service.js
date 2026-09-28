/**
 * Avatar Service
 *
 * Handles avatar upload, storage, and removal. Files are stored in
 * private object storage and served via short-lived signed URLs.
 *
 * @module signalforge/server/modules/users/profile/avatar
 */
const path = require('node:path');
const crypto = require('node:crypto');
const storageConfig = require('../../../config/storage.config.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { UserRepository } = require('../user.repository.js');
const { emitAvatarUpdated, emitAvatarRemoved } = require('../user.events.js');
const { InvalidAvatarError, AvatarTooLargeError } = require('../user.errors.js');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
class AvatarService {
  constructor(userRepository = null, storageClient = null) {
    this.userRepository = userRepository || new UserRepository();
    this.storage = storageClient || null;
    this.logger = getLogger('avatar');
  }

  validateFile(file) {
    if (!file) {
      throw new InvalidAvatarError('Avatar file is required');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new InvalidAvatarError(
        `Avatar type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
    if (file.size && file.size > MAX_SIZE_BYTES) {
      throw new AvatarTooLargeError(
        `Avatar must not exceed ${MAX_SIZE_BYTES / 1024 / 1024} MB`,
      );
    }
  }

  buildStorageKey(userId, originalName) {
    const ext = path.extname(originalName || '').toLowerCase() || '.jpg';
    const unique = crypto.randomBytes(8).toString('hex');
    return `${storageConfig.paths.userAvatars}/${userId}/${Date.now()}-${unique}${ext}`;
  }

  async upload(userId, file) {
    this.validateFile(file);

    const storageKey = this.buildStorageKey(userId, file.originalname);

    if (this.storage) {
      await this.storage.upload(storageKey, file.buffer, {
        contentType: file.mimetype,
        metadata: {
          userId,
          originalName: file.originalname,
        },
      });
    }

    const publicUrl = this.storage
      ? await this.storage.getSignedUrl(storageKey, storageConfig.signedUrl.ttlSeconds)
      : null;

    await this.userRepository.update(userId, { avatarUrl: storageKey });

    await emitAvatarUpdated(userId, storageKey);

    return {
      storageKey,
      url: publicUrl,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async remove(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.avatar_url) {
      return { removed: false };
    }

    if (this.storage) {
      try {
        await this.storage.delete(user.avatar_url);
      } catch (error) {
        this.logger.warn({ err: error, userId }, 'Failed to delete avatar file');
      }
    }

    await this.userRepository.update(userId, { avatarUrl: null });
    await emitAvatarRemoved(userId);

    return { removed: true };
  }

  async getSignedUrl(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.avatar_url) {
      return null;
    }
    if (!this.storage) {
      return user.avatar_url;
    }
    return this.storage.getSignedUrl(user.avatar_url, storageConfig.signedUrl.ttlSeconds);
  }
}
module.exports = AvatarService;
module.exports.AvatarService = AvatarService;
