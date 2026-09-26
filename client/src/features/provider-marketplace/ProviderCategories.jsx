import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Target,
  Zap,
  Repeat,
  Wind,
  Globe,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';

const CATEGORY_ICONS = {
  forex: Globe,
  gold: Target,
  indices: TrendingUp,
  crypto: Zap,
  scalping: Zap,
  swing: TrendingUp,
  grid: Repeat,
  news: Wind,
};

const ProviderCategories = function ProviderCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/categories', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setCategories(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider Categories
            </Heading>
            <Text color="muted" className="text-xs">
              Browse providers by market focus and trading style
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCategories}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.key] || Users;
              return (
                <Card
                  key={category.key}
                  padding="lg"
                  hoverable
                  clickable
                  onClick={() => navigate(`/providers?category=${category.key}`)}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-slate-900">{category.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {category.description || `${category.providersCount || 0} providers`}
                      </p>
                      <p className="mt-2 text-[11px] font-medium text-indigo-600">
                        {category.providersCount || 0} providers
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
};

export default ProviderCategories;