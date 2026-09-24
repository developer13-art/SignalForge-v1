/**
 * Verification API (public)
 *
 * @module client/src/api/verification.api
 */

import { get } from './client.js';
import { endpoints } from './endpoints.js';

export const verificationApi = {
  getAttestationById: (attestationId) =>
    get(endpoints.verification.attestationById(attestationId)),

  getAttestationByHash: (hash) => get(endpoints.verification.attestationByHash(hash)),

  getSignalProvenance: (signalId) => get(endpoints.verification.signalProvenance(signalId)),

  getProcessingHash: (hash) => get(endpoints.verification.processingHash(hash)),

  auditAttestation: (attestationId) =>
    get(endpoints.verification.auditAttestation(attestationId)),

  auditProvenance: (provenanceId) =>
    get(endpoints.verification.auditProvenance(provenanceId)),

  auditPending: (params) => get(endpoints.verification.auditPending, { params }),
};

export default verificationApi;