import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, RefreshCw, Loader2, Search, ArrowRight } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const KnowledgeBase = function KnowledgeBase() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('q', search);
      }
      if (activeCategory) {
        params.append('category', activeCategory);
      }

      const response = await fetch(`/api/support/knowledge-base?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setArticles(payload.data?.articles || []);
        setCategories(payload.data?.categories || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BookOpen size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Knowledge Base
            </Heading>
            <Text color="muted" className="text-xs">
              In-depth guides, tutorials, and documentation
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search articles"
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {categories.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('')}
              className={[
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                activeCategory === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                  activeCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : articles.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No articles found"
              description={
                search ? 'Try a different search term.' : 'Articles will appear here.'
              }
            />
          ) : (
            articles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => navigate(`/support/knowledge-base/${article.slug}`)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{article.title}</p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {article.excerpt}
                  </p>
                  {article.category ? (
                    <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                      {article.category}
                    </span>
                  ) : null}
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-300" aria-hidden="true" />
              </button>
            ))
          )}
        </div>
      </Card>
    </Container>
  );
};

export default KnowledgeBase;