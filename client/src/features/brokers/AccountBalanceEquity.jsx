import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import AccountBalanceWidget from '../../components/domain/broker/AccountBalanceWidget';
import EquityCurveChart from '../../components/charts/EquityCurveChart';

const AccountBalanceEquity = function AccountBalanceEquity() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/brokers/accounts/${accountId}/balance`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="lg" className="py-6">
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
        {loading && !data ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : data ? (
          <>
            <AccountBalanceWidget
              balance={data.balance}
              equity={data.equity}
              margin={data.margin}
              freeMargin={data.freeMargin}
              marginLevel={data.marginLevel}
              profit={data.floatingProfit}
              currency={data.currency}
              environment={data.accountType}
              accountName={data.nickname}
              accountNumber={data.login}
            />

            <Card padding="lg" className="mt-4">
              <Heading level={3} size="text-base">
                Equity Curve
              </Heading>
              <Text color="muted" className="mt-1 text-xs">
                Account equity over the last 30 days
              </Text>

              {data.equityHistory && data.equityHistory.length > 0 ? (
                <div className="mt-4">
                  <EquityCurveChart
                    data={data.equityHistory}
                    xKey="date"
                    dataKey="equity"
                    height={280}
                    color="#4f46e5"
                    valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No equity history yet.</p>
              )}
            </Card>
          </>
        ) : null}
      </div>
    </Container>
  );
};

export default AccountBalanceEquity;