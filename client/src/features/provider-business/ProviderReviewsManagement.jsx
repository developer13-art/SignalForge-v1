import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Loader2, RefreshCw, MessageCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProviderReviewCard from '../../components/domain/provider/ProviderReviewCard';
import EmptyState from '../../components/common/EmptyState';

const ProviderReviewsManagement = function ProviderReviewsManagement() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/reviews', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setReviews(payload.data?.items || []);
        setSummary(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

  const handleReply = useCallback((review) => {
    // opens a reply dialog in future
    // eslint-disable-next-line no-console
    console.info('Reply to review', review.id);
  }, []);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchReviews}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Star size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Reviews
            </Heading>
            <Text color="muted" className="text-xs">
              Manage and respond to subscriber reviews
            </Text>
          </div>
        </div>

        {summary ? (
          <>
            <Separator spacing="md" />

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-900">{summary.rating}</p>
                <div className="mt-1 flex items-center justify-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < Math.round(summary.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">{summary.totalReviews} reviews</p>
              </div>
            </div>
          </>
        ) : null}

        <Separator spacing="md" />

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Subscribers will be able to leave reviews soon."
            />
          ) : (
            reviews.map((review) => (
              <ProviderReviewCard
                key={review.id}
                review={review}
                onReply={handleReply}
              />
            ))
          )}
        </div>
      </Card>
    </Container>
  );
};

export default ProviderReviewsManagement;