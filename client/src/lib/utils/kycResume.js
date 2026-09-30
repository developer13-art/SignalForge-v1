const STATUS_ROUTES = {
  VERIFIED: '/kyc/result',
  UNDER_REVIEW: '/kyc/review-status',
  APPROVED: '/kyc/review-status',
  REJECTED: '/kyc/resubmission',
  EXPIRED: '/kyc/personal-info',
  SUSPENDED: '/kyc/status',
};

export function resolveKycResume(application, documents = []) {
  if (!application) {
    return null;
  }

  const status = String(application.status || 'PENDING').toUpperCase();
  if (STATUS_ROUTES[status]) {
    return { path: STATUS_ROUTES[status] };
  }

  if (!application.personalInfo) {
    return { path: '/kyc/personal-info' };
  }

  const identityDocument = documents.find(
    (document) => String(document.documentType || '').toUpperCase() !== 'SELFIE',
  );

  if (!identityDocument) {
    return {
      path: application.documentType
        ? '/kyc/document-upload'
        : '/kyc/document-selection',
      state: application.documentType
        ? { documentType: application.documentType }
        : undefined,
    };
  }

  const selfieUploaded = documents.some(
    (document) => String(document.documentType || '').toUpperCase() === 'SELFIE',
  );

  return {
    path: selfieUploaded ? '/kyc/selfie-verification' : '/kyc/document-verification',
    state: {
      documentType: identityDocument.documentType,
      uploadId: identityDocument.id,
      resumeWithSavedSelfie: selfieUploaded,
    },
  };
}

export default resolveKycResume;