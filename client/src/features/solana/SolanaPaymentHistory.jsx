import React, { useCallback, useEffect, useState } from 'react';
import { Coins, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import TxSignatureLink from '../../components/domain/solana/TxSignatureLink';
import PaymentStatusBadge from '../../components/domain/payment/PaymentStatusBadge';
import EmptyState from '../../components/common/EmptyState';

const SolanaPaymentHistory = function SolanaPaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/solana/payments', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setPayments(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      accessor: 'date',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      accessor: 'description',
      render: (value) => (
        <span className="text-sm text-slate-700">{value}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: 'amount',
      align: 'right',
      render: (value, row) => (
        <span className="text-sm font-semibold text-slate-900">
          {value} {row.token}
        </span>
      ),
    },
    {
      key: 'signature',
      header: 'Transaction',
      align: 'right',
      render: (value, row) =>
        row.txSignature ? (
          <TxSignatureLink signature={row.txSignature} size="sm" network="mainnet" />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      align: 'right',
      render: (value) => <PaymentStatusBadge status={value} size="xs" />,
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Coins size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Solana Payment History
            </Heading>
            <Text color="muted" className="text-xs">
              All your Solana payments with verifiable on-chain transaction signatures
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchPayments}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={payments}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={Coins}
              title="No Solana payments"
              description="Solana-based subscription payments will appear here."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default SolanaPaymentHistory;