import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, ArrowLeft, Loader2, RefreshCw, Plus } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';

const TraderReviews = function TraderReviews() {
  const { traderId } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketplace/traders/${traderId}/reviews`, {
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
  }, [traderId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchReviews}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/traders/${traderId}/reviews/new`)}
            leadingIcon={Plus}
          >
            Write Review
          </Button>
        </div>
      </div>

      {summary ? (
        <Card padding="lg" className="mt-4">
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

            <Separator orientation="vertical" className="h-16" />

            <div className="flex-1">
              {summary.distribution?.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="w-6 text-xs text-slate-500">{item.stars}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-slate-500">
                    {item.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : null}

      <div className="mt-4 space-y-3">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : reviews.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Be the first to review this trader."
            />
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} padding="lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{review.author}</p>
                  <div className="mt-0.5 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={
                          i < (review.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">{review.date}</span>
              </div>
              {review.title ? (
                <p className="mt-2 text-sm font-semibold text-slate-800">{review.title}</p>
              ) : null}
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.body}</p>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default TraderReviews;