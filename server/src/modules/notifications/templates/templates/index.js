/**
 * Notification Templates Index
 *
 * Exports every built-in notification template. These templates are
 * registered at bootstrap so the platform has baseline content for
 * common notification types.
 *
 * @module server/modules/notifications/templates/templates
 */

export * from './welcome.template';
export * from './email-verification.template';
export * from './password-reset.template';
export * from './kyc-submitted.template';
export * from './kyc-approved.template';
export * from './kyc-rejected.template';
export * from './signal-detected.template';
export * from './signal-executed.template';
export * from './trade-opened.template';
export * from './trade-closed.template';
export * from './stop-loss-hit.template';
export * from './take-profit-hit.template';
export * from './broker-disconnected.template';
export * from './subscription-expiring.template';
export * from './subscription-activated.template';
export * from './payment-successful.template';
export * from './payment-failed.template';
export * from './referral-credited.template';
export * from './referral-settled.template';
export * from './withdrawal-approved.template';
export * from './withdrawal-rejected.template';
export * from './security-alert.template';
export * from './system-notice.template';