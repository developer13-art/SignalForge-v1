/**
 * Compliance Routes
 *
 * Compliance officer console routes. Requires COMPLIANCE_OFFICER,
 * ADMIN, or SUPER_ADMIN role.
 *
 * @module client/src/routes/ComplianceRoutes
 */

import { Route } from 'react-router-dom';

import ComplianceLayout from '../layouts/ComplianceLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

import ComplianceDashboard from '../features/compliance/ComplianceDashboard.jsx';
import KycQueue from '../features/compliance/KycQueue.jsx';
import PendingVerification from '../features/compliance/PendingVerification.jsx';
import UnderReview from '../features/compliance/UnderReview.jsx';
import VerifiedUsers from '../features/compliance/VerifiedUsers.jsx';
import RejectedApplications from '../features/compliance/RejectedApplications.jsx';
import SuspendedVerification from '../features/compliance/SuspendedVerification.jsx';
import DocumentTypes from '../features/compliance/DocumentTypes.jsx';
import VerificationProviders from '../features/compliance/VerificationProviders.jsx';
import RiskFlags from '../features/compliance/RiskFlags.jsx';
import ComplianceReports from '../features/compliance/ComplianceReports.jsx';
import KycAuditTrail from '../features/compliance/KycAuditTrail.jsx';

export default function ComplianceRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route element={<RoleRoute allowed={['COMPLIANCE_OFFICER', 'ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<ComplianceLayout />}>
          <Route path="/compliance" element={<ComplianceDashboard />} />
          <Route path="/compliance/kyc-queue" element={<KycQueue />} />
          <Route path="/compliance/kyc-queue/pending" element={<PendingVerification />} />
          <Route path="/compliance/kyc-queue/under-review" element={<UnderReview />} />
          <Route path="/compliance/kyc-queue/verified" element={<VerifiedUsers />} />
          <Route path="/compliance/kyc-queue/rejected" element={<RejectedApplications />} />
          <Route path="/compliance/kyc-queue/suspended" element={<SuspendedVerification />} />
          <Route path="/compliance/document-types" element={<DocumentTypes />} />
          <Route path="/compliance/verification-providers" element={<VerificationProviders />} />
          <Route path="/compliance/risk-flags" element={<RiskFlags />} />
          <Route path="/compliance/reports" element={<ComplianceReports />} />
          <Route path="/compliance/audit" element={<KycAuditTrail />} />
        </Route>
      </Route>
    </Route>
  );
}