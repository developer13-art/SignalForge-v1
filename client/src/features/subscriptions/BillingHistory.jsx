import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import BillingHistoryTable from '../../components/domain/subscription/BillingHistoryTable';

const BillingHistory = function BillingHistory() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/billing', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setInvoices(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleBack = useCallback(() => navigate('/subscriptions'), [navigate]);

  const handleDownload = useCallback((invoice) => {
    window.open(`/api/subscriptions/billing/${invoice.id}/download`, '_blank');
  }, []);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchInvoices}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Billing History
            </Heading>
            <Text color="muted" className="text-xs">
              All your past invoices and payments
            </Text>
          </div>
        </div>

        <div className="mt-6">
          <BillingHistoryTable
            invoices={invoices}
            loading={loading}
            onRowClick={(row) => navigate(`/subscriptions/invoices/${row.id}`)}
            onDownload={handleDownload}
            currency="USD"
          />
        </div>
      </Card>
    </Container>
  );
};

export default BillingHistory;