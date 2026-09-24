/**
 * Auth Routes
 *
 * Authentication and onboarding routes. Uses AuthLayout which
 * renders a centered card with the SignalForge logo and a minimal
 * background.
 *
 * @module client/src/routes/AuthRoutes
 */

import { Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';

import Login from '../features/auth/Login.jsx';
import Register from '../features/auth/Register.jsx';
import EmailVerification from '../features/auth/EmailVerification.jsx';
import PhoneVerification from '../features/auth/PhoneVerification.jsx';
import ForgotPassword from '../features/auth/ForgotPassword.jsx';
import ResetPassword from '../features/auth/ResetPassword.jsx';
import TwoFactorSetup from '../features/auth/TwoFactorSetup.jsx';
import TwoFactorVerify from '../features/auth/TwoFactorVerify.jsx';
import AccountRecovery from '../features/auth/AccountRecovery.jsx';
import SessionVerification from '../features/auth/SessionVerification.jsx';

export default function AuthRoutes() {
  return (
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/verify-phone" element={<PhoneVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/2fa/setup" element={<TwoFactorSetup />} />
      <Route path="/2fa/verify" element={<TwoFactorVerify />} />
      <Route path="/account-recovery" element={<AccountRecovery />} />
      <Route path="/session-verification" element={<SessionVerification />} />
    </Route>
  );
}