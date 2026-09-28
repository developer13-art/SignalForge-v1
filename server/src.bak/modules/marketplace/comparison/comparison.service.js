/**
 * Comparison Service
 *
 * @module signalforge/server/modules/marketplace/comparison/comparison
 */

import { ListingRepository } from '../listings/repository.js';
import { ProviderRepository } from '../../providers/provider.repository.js';
import { ComparisonFailedError } from '../marketplace.errors.js';

export class ComparisonService {
  constructor(listingRepository = null, providerRepository = null) {
    this.listings = listingRepository || new ListingRepository();
    this.providers = providerRepository || new ProviderRepository();
  }

  async compare(providerIds) {
    if (!Array.isArray(providerIds) || providerIds.length < 2 || providerIds.length > 5) {
      throw new ComparisonFailedError('Comparison requires 2 to 5 providers');
    }

    const results = [];

    for (const providerId of providerIds) {
      const provider = await this.providers.findById(providerId);
      if (!provider) {
        continue;
      }
      const listing = await this.listings.findByProviderId(providerId);

      results.push({
        providerId: provider.id,
        displayName: provider.display_name,
        slug: provider.slug,
        status: provider.status,
        certificationStatus: provider.certification_status,
        subscriberCount: provider.subscriber_count,
        winRate: provider.win_rate,
        averageRr: provider.average_rr,
        consistencyScore: provider.consistency_score,
        reputationScore: provider.reputation_score,
        listing: listing
          ? {
              id: listing.id,
              title: listing.title,
              price: listing.price,
              currency: listing.currency,
              billingInterval: listing.billing_interval,
              ratingAverage: listing.rating_average,
              ratingCount: listing.rating_count,
            }
          : null,
      });
    }

    return {
      providers: results,
      comparedAt: new Date().toISOString(),
    };
  }

  buildComparisonMatrix(providers) {
    return {
      subscribers: providers.map((p) => ({
        providerId: p.providerId,
        value: p.subscriberCount,
      })),
      winRate: providers.map((p) => ({
        providerId: p.providerId,
        value: p.winRate,
      })),
      averageRr: providers.map((p) => ({
        providerId: p.providerId,
        value: p.averageRr,
      })),
      consistencyScore: providers.map((p) => ({
        providerId: p.providerId,
        value: p.consistencyScore,
      })),
      reputationScore: providers.map((p) => ({
        providerId: p.providerId,
        value: p.reputationScore,
      })),
      price: providers.map((p) => ({
        providerId: p.providerId,
        value: p.listing?.price ?? null,
      })),
    };
  }
}

export default ComparisonService;