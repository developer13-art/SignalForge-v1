import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowLeft } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import BrokerConnectForm from '../../components/domain/broker/BrokerConnectForm';

const Mt5Connection = function Mt5Connection() {
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (values) => {
      const response = await fetch('/api/brokers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...values, platform: 'mt5' }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Failed to connect broker account');
      }

      navigate(`/brokers/accounts/${payload.data.id}`);
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
          <BrokerConnectForm onSubmit={handleSubmit} onCancel={handleBack} />
        </div>
      </Card>
    </Container>
  );
};

export default Mt5Connection;