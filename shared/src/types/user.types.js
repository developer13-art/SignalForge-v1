/**
 * User Type Definitions
 *
 * Provides JSDoc typedefs for user-related objects.
 *
 * @module @signalforge/shared/types/user
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string|null} phone
 * @property {string} passwordHash
 * @property {string|null} firstName
 * @property {string|null} middleName
 * @property {string|null} lastName
 * @property {string|null} username
 * @property {string|null} avatarUrl
 * @property {string} status
 * @property {string} kycStatus
 * @property {string} accountType
 * @property {string|null} emailVerifiedAt
 * @property {string|null} phoneVerifiedAt
 * @property {string|null} lastLoginAt
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} profileId
 * @property {string} userId
 * @property {string|null} dateOfBirth
 * @property {string|null} nationality
 * @property {string|null} country
 * @property {string|null} city
 * @property {string|null} address
 * @property {string|null} postalCode
 * @property {string|null} timezone
 * @property {string|null} language
 * @property {string|null} tradingExperience
 * @property {Object|null} preferences
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Role
 * @property {string} roleId
 * @property {string} name
 * @property {string|null} description
 * @property {boolean} isSystem
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Permission
 * @property {string} permissionId
 * @property {string} name
 * @property {string|null} description
 * @property {string} group
 * @property {string} createdAt
 */

/**
 * @typedef {Object} UserRole
 * @property {string} userId
 * @property {string} roleId
 * @property {string} assignedAt
 * @property {string|null} assignedBy
 */

/**
 * @typedef {Object} UserSession
 * @property {string} sessionId
 * @property {string} userId
 * @property {string} token
 * @property {string} refreshToken
 * @property {string|null} ipAddress
 * @property {string|null} userAgent
 * @property {string|null} deviceId
 * @property {string} expiresAt
 * @property {string|null} revokedAt
 * @property {string} createdAt
 * @property {string} lastUsedAt
 */

/**
 * @typedef {Object} TwoFactorAuth
 * @property {string} twoFactorId
 * @property {string} userId
 * @property {string} method
 * @property {string|null} secret
 * @property {Array<string>} backupCodes
 * @property {boolean} enabled
 * @property {string|null} verifiedAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ApiKey
 * @property {string} apiKeyId
 * @property {string} userId
 * @property {string} name
 * @property {string} prefix
 * @property {string} hashedKey
 * @property {Array<string>} permissions
 * @property {Array<string>} ipWhitelist
 * @property {string|null} expiresAt
 * @property {string|null} lastUsedAt
 * @property {string|null} revokedAt
 * @property {string} createdAt
 */

export const USER_TYPES = Object.freeze({
  User: 'User',
  UserProfile: 'UserProfile',
  Role: 'Role',
  Permission: 'Permission',
  UserRole: 'UserRole',
  UserSession: 'UserSession',
  TwoFactorAuth: 'TwoFactorAuth',
  ApiKey: 'ApiKey',
});