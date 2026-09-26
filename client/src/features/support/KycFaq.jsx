import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const KycFaq = function KycFaq() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/support/faq/kyc', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setFaqs(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleBack = useCallback(() => navigate('/support'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Shield size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                KYC FAQ
              </Heading>
              <Text color="muted" className="text-xs">
                Common questions about identity verification
              </Text>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchFaqs}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : faqs.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No FAQs available"
              description="FAQ entries will appear here."
            />
          ) : (
            faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <Card key={faq.id || index} padding="none">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="text-sm font-semibold text-slate-900">{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={[
                        'shrink-0 text-slate-400 transition-transform',
                        isOpen ? 'rotate-180' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen ? (
                    <div className="border-t border-slate-100 px-5 py-4">
                      <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                    </div>
                  ) : null}
                </Card>
              );
            })
          )}
        </div>
      </Card>
    </Container>
  );
};

export default KycFaq;