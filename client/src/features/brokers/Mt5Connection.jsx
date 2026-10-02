import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowLeft } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import BrokerConnectForm from '../../components/domain/broker/BrokerConnectForm';
import { authenticatedFetch as fetch } from '../../api/authenticated-fetch.js';

const Mt5Connection = function Mt5Connection() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (values) => {
      setError(null);
      setSubmitting(true);
      try {
        const response = await fetch('/api/brokers/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'MT5',
            brokerName: values.broker,
            accountType: values.accountType?.toUpperCase(),
            server: values.server,
            accountNumber: values.login,
            password: values.password,
            accountNickname: values.nickname,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const details = payload?.error?.details;
          const cause = details?.networkCode
            ? `${details.cause} (${details.networkCode})`
            : details?.cause;
          throw new Error(
            cause || payload?.error?.message || `Broker connection failed (${response.status})`,
          );
        }
        if (!payload?.account?.id) {
          throw new Error('The server returned an invalid broker connection response');
        }

        navigate(`/brokers/accounts/${payload.account.id}`);
      } catch (submitError) {
        setError(submitError.message || 'Failed to connect broker account');
      } finally {
        setSubmitting(false);
      }
    },
    [navigate],
  );

  const handleBack = useCallback(() => navigate('/brokers/connect'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Server size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Connect MetaTrader 5
            </Heading>
            <Text color="muted" className="text-xs">
              Enter your MT5 account credentials to establish a cloud connection
            </Text>
          </div>
        </div>

        <div className="mt-6">
          <BrokerConnectForm
            platform="MT5"
            error={error}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={handleBack}
          />
        </div>
      </Card>
    </Container>
  );
};

export default Mt5Connection;