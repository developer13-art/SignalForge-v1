import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import OpenPositionsTable from '../../components/domain/trade/OpenPositionsTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const OpenPositions = function OpenPositions() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trading/open-positions', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setPositions(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 15000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  const handleClosePosition = useCallback(async () => {
    if (!closing) {
      return;
    }

    try {
      await fetch(`/api/trading/positions/${closing.id}/close`, {
        method: 'POST',
        credentials: 'include',
      });
      setClosing(null);
      fetchPositions();
    } catch (_err) {
      // silent
    }
  }, [closing, fetchPositions]);

  const handleModifyPosition = useCallback(
    (position) => {
      navigate(`/trading/positions/${position.id}`);
    },
    [navigate],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Layers size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Open Positions
            </Heading>
            <Text color="muted" className="text-xs">
              {positions.length} position{positions.length !== 1 ? 's' : ''} currently open
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchPositions}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <OpenPositionsTable
          positions={positions}
          loading={loading}
          onRowClick={(row) => navigate(`/trading/positions/${row.id}`)}
          onClosePosition={(row) => setClosing(row)}
          onModifyPosition={handleModifyPosition}
          showProvider
          showActions
        />
      </Card>

      <ConfirmDialog
        open={Boolean(closing)}
        onClose={() => setClosing(null)}
        onConfirm={handleClosePosition}
        title="Close position"
        description={
          closing
            ? `Are you sure you want to close your ${closing.symbol} ${closing.direction} position at market price?`
            : ''
        }
        confirmLabel="Close Position"
        variant="warning"
      />
    </Container>
  );
};

export default OpenPositions;