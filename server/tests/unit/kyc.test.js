/**
 * KYC Unit Tests
 *
 * @module server/tests/unit/kyc.test
 */

import { describe, test, expect } from '@jest/globals';
import { serializeKycApplication } from '../../src/lib/serializers/kyc.serializer';

describe('KYC serializer', () => {
  test('serializeKycApplication returns expected shape', () => {
    const application = {
      id: 'k1',
      user_id: 'u1',
      status: 'UNDER_REVIEW',
      provider: 'SMILE_ID',
      document_type: 'NATIONAL_ID',
      submitted_at: '2024-01-01T00:00:00Z',
      reviewed_at: null,
      verified_at: null,
      expires_at: null,
      rejection_reason: null,
    };

    const result = serializeKycApplication(application);
    expect(result.applicationId).toBe('k1');
    expect(result.status).toBe('UNDER_REVIEW');
    expect(result.documentType).toBe('NATIONAL_ID');
  });
});