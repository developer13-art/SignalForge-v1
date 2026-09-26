import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import InvoiceCard from '../../components/domain/subscription/InvoiceCard';
import ErrorState from '../../components/common/ErrorState';

const InvoiceDetails = function InvoiceDetails() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/subscriptions/billing/${invoiceId}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load invoice');
        return;
      }
      setInvoice(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleDownload = useCallback(() => {
    window.open(`/api/subscriptions/billing/${invoiceId}/download`, '_blank');
  }, [invoiceId]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchInvoice}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : error ? (
          <Card padding="lg">
            <ErrorState title="Failed to load" description={error} onRetry={fetchInvoice} />
          </Card>
        ) : (
          <InvoiceCard invoice={invoice} onDownload={handleDownload} />
        )}
      </div>
    </Container>
  );
};

export default InvoiceDetails;