/**
 * Route Index
 *
 * Top-level router composition. Wires every domain route group into
 * a single React Router tree and mounts the fallback 404 handler.
 *
 * @module client/src/routes
 */

import { Routes, Route, Navigate } from 'react-router-dom';

import PublicRoutes from './PublicRoutes.jsx';
import AuthRoutes from './AuthRoutes.jsx';
import UserRoutes from './UserRoutes.jsx';
import ProviderRoutes from './ProviderRoutes.jsx';
import AdminRoutes from './AdminRoutes.jsx';
import ComplianceRoutes from './ComplianceRoutes.jsx';
import ExecutiveRoutes from './ExecutiveRoutes.jsx';
import SupportRoutes from './SupportRoutes.jsx';
import NotFoundRoute from './NotFoundRoute.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/auth/*" element={<Navigate to="/login" replace />} />

      {AuthRoutes()}
      {PublicRoutes()}
      {UserRoutes()}
      {ProviderRoutes()}
      {AdminRoutes()}
      {ComplianceRoutes()}
      {ExecutiveRoutes()}
      {SupportRoutes()}

      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}