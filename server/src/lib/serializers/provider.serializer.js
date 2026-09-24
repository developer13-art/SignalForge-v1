/**
 * Provider Serializer
 *
 * @module server/lib/serializers/provider.serializer
 */

export function serializeProvider(provider) {
  if (!provider) {
    return null;
  }

  return {
    providerId: provider.id,
    userId: provider.user_id,
    displayName: provider.display_name,
    description: provider.description,
    avatarUrl: provider.avatar_url,
    status: provider.status,
    certificationStatus: provider.certification_status,
    certifiedAt: provider.certified_at,
    subscriberCount: provider.subscriber_count,
    createdAt: provider.created_at,
  };
}

export default serializeProvider;