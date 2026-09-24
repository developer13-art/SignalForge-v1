/**
 * User Serializer
 *
 * @module server/lib/serializers/user.serializer
 */

export function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    middleName: user.middle_name,
    lastName: user.last_name,
    avatarUrl: user.avatar_url,
    status: user.status,
    kycStatus: user.kyc_status,
    accountType: user.account_type,
    emailVerifiedAt: user.email_verified_at,
    phoneVerifiedAt: user.phone_verified_at,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export function serializeUserPublic(user) {
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    username: user.username,
    displayName: [user.first_name, user.last_name].filter(Boolean).join(' ') || null,
    avatarUrl: user.avatar_url,
  };
}

export default serializeUser;