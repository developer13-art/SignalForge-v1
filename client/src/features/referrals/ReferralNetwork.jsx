import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ReferralNetworkTable from '../../components/domain/referral/ReferralNetworkTable';

const ReferralNetwork = function ReferralNetwork() {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/network', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setReferrals(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

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
          onClick={fetchReferrals}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Referral Network
            </Heading>
            <Text color="muted" className="text-xs">
              All users in your referral network with performance and reward status
            </Text>
          </div>
        </div>

        <div className="mt-6">
          <ReferralNetworkTable
            referrals={referrals}
            loading={loading}
            onRowClick={(row) => navigate(`/referrals/users/${row.id}`)}
          />
        </div>
      </Card>
    </Container>
  );
};

export default ReferralNetwork;