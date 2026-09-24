/**
 * KYC Serializer
 *
 * @module server/lib/serializers/kyc.serializer
 */

export function serializeKycApplication(application) {
  if (!application) {
    return null;
  }

  return {
    applicationId: application.id,
    userId: application.user_id,
    status: application.status,
    provider: application.provider,
    documentType: application.document_type,
    submittedAt: application.submitted_at,
    reviewedAt: application.reviewed_at,
    verifiedAt: application.verified_at,
    expiresAt: application.expires_at,
    rejectionReason: application.rejection_reason,
  };
}

export default serializeKycApplication;