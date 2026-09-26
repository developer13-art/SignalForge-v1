import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ReferralSettlementTable from '../../components/domain/referral/ReferralSettlementTable';
import StatCard from '../../components/data-display/StatCard';

const MonthlySettlement = function MonthlySettlement() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/settlements', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setSettlements(payload.data?.items || []);
        setData(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => navigate('/referrals'), [navigate]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
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

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Monthly Settlement
            </Heading>
            <Text color="muted" className="text-xs">
              Monthly referral reward settlement runs
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Next Settlement"
            value={data?.nextSettlement || '—'}
            icon={Clock}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Current Period"
            value={data?.currentPeriod || '—'}
            icon={Clock}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="This Month"
            value={data?.thisMonthEarned !== undefined ? `$${data.thisMonthEarned}` : '—'}
            icon={Clock}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Settlements"
            value={settlements.length}
            icon={Clock}
            variant="default"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Settlement History
          </Heading>

          <div className="mt-4">
            <ReferralSettlementTable
              settlements={settlements}
              loading={loading}
              currency="USD"
            />
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default MonthlySettlement;