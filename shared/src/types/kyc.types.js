/**
 * KYC Type Definitions
 *
 * Provides JSDoc typedefs for KYC-related objects.
 *
 * @module @signalforge/shared/types/kyc
 */

/**
 * @typedef {Object} KycApplication
 * @property {string} applicationId
 * @property {string} userId
 * @property {string} status
 * @property {string|null} provider
 * @property {string|null} providerReference
 * @property {Object} personalInfo
 * @property {string|null} documentType
 * @property {Array<KycDocument>} documents
 * @property {KycSelfie|null} selfie
 * @property {KycVerification|null} verifications
 * @property {string|null} reviewerId
 * @property {string|null} rejectionReason
 * @property {string|null} reviewNotes
 * @property {string} submittedAt
 * @property {string|null} reviewedAt
 * @property {string|null} verifiedAt
 * @property {string|null} expiresAt
 * @property {Object|null} metadata
 */

/**
 * @typedef {Object} KycPersonalInfo
 * @property {string} firstName
 * @property {string|null} middleName
 * @property {string} lastName
 * @property {string} dateOfBirth
 * @property {string} nationality
 * @property {string} country
 * @property {string|null} address
 * @property {string|null} city
 * @property {string|null} state
 * @property {string|null} postalCode
 * @property {string|null} phoneNumber
 */

/**
 * @typedef {Object} KycDocument
 * @property {string} documentId
 * @property {string} applicationId
 * @property {string} type
 * @property {string} storageKey
 * @property {string} mimeType
 * @property {number} sizeBytes
 * @property {string|null} encryptedNumber
 * @property {string} uploadedAt
 */

/**
 * @typedef {Object} KycSelfie
 * @property {string} documentId
 * @property {string} storageKey
 * @property {number|null} livenessScore
 * @property {string} uploadedAt
 */

/**
 * @typedef {Object} KycVerification
 * @property {string} verificationId
 * @property {string} applicationId
 * @property {boolean|null} documentCheck
 * @property {boolean|null} identityCheck
 * @property {boolean|null} livenessCheck
 * @property {boolean|null} nameMatch
 * @property {boolean|null} dobMatch
 * @property {number|null} riskScore
 * @property {string} result
 * @property {string} performedAt
 */

/**
 * @typedef {Object} KycDocumentType
 * @property {string} documentTypeId
 * @property {string} code
 * @property {string} label
 * @property {string|null} description
 * @property {boolean} enabled
 * @property {string|null} country
 * @property {number} displayOrder
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} KycAuditLog
 * @property {string} auditId
 * @property {string} applicationId
 * @property {string} userId
 * @property {string} actorId
 * @property {string} actorType
 * @property {string} action
 * @property {string|null} oldStatus
 * @property {string|null} newStatus
 * @property {string|null} reason
 * @property {Object|null} metadata
 * @property {string} timestamp
 */

export const KYC_TYPES = Object.freeze({
  KycApplication: 'KycApplication',
  KycPersonalInfo: 'KycPersonalInfo',
  KycDocument: 'KycDocument',
  KycSelfie: 'KycSelfie',
  KycVerification: 'KycVerification',
  KycDocumentType: 'KycDocumentType',
  KycAuditLog: 'KycAuditLog',
});