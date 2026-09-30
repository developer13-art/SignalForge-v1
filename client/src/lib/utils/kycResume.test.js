import { describe, expect, it } from 'vitest';

import { resolveKycResume } from './kycResume.js';

const application = {
  status: 'PENDING',
  personalInfo: { firstName: 'Ada' },
};

describe('resolveKycResume', () => {
  it('returns null when the user has not started an application', () => {
    expect(resolveKycResume(null)).toBeNull();
  });

  it('resumes at personal information when it has not been saved', () => {
    expect(resolveKycResume({ ...application, personalInfo: null })).toEqual({
      path: '/kyc/personal-info',
    });
  });

  it('resumes document selection when no document is saved', () => {
    expect(resolveKycResume(application, [])).toEqual({
      path: '/kyc/document-selection',
      state: undefined,
    });
  });

  it('resumes verification with the saved document reference', () => {
    expect(
      resolveKycResume(application, [
        { id: 'document-1', documentType: 'passport' },
      ]),
    ).toEqual({
      path: '/kyc/document-verification',
      state: {
        documentType: 'passport',
        uploadId: 'document-1',
        resumeWithSavedSelfie: false,
      },
    });
  });

  it('resumes at confirmation when the document and selfie are already saved', () => {
    expect(
      resolveKycResume(application, [
        { id: 'document-1', documentType: 'passport' },
        { id: 'selfie-1', documentType: 'SELFIE' },
      ]),
    ).toEqual({
      path: '/kyc/selfie-verification',
      state: {
        documentType: 'passport',
        uploadId: 'document-1',
        resumeWithSavedSelfie: true,
      },
    });
  });

  it.each([
    ['VERIFIED', '/kyc/result'],
    ['UNDER_REVIEW', '/kyc/review-status'],
    ['REJECTED', '/kyc/resubmission'],
  ])('routes %s applications to %s', (status, path) => {
    expect(resolveKycResume({ ...application, status })).toEqual({ path });
  });
});