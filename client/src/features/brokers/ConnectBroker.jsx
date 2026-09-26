import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowLeft, ArrowRight, CheckCircle2, Zap, Shield, Globe, Layers } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const STEPS = [
  {
    icon: Zap,
    title: 'Instant Cloud Connection',
    description: 'No expert advisor, no VPS, no local terminal. MetaApi maintains a persistent cloud connection.',
  },
  {
    icon: Shield,
    title: 'Encrypted Credentials',
    description: 'Your broker password is encrypted and stored in a secrets vault. It never reaches the frontend.',
  },
  {
    icon: Globe,
    title: 'Full Synchronization',
    description: 'Positions, orders, and history are synchronized in real time into SignalForge.',
  },
  {
    icon: Layers,
    title: 'Multiple Accounts',
    description: 'Connect multiple MT4 and MT5 accounts and route signals per subscription.',
  },
];

const ConnectBroker = function ConnectBroker() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState(null);

  const handleSelect = useCallback(
    (selected) => {
      setPlatform(selected);
      navigate(selected === 'mt5' ? '/brokers/connect/mt5' : '/brokers/connect/mt4');
    },
    [navigate],
  );

  const handleBack = useCallback(() => navigate('/brokers/accounts'), [navigate]);

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
              Connect Broker Account
            </Heading>
            <Text color="muted" className="text-xs">
              Choose your trading platform to get started
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => handleSelect('mt5')}
            className="group flex flex-col items-start gap-3 rounded-lg border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Server size={26} aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-slate-900">MetaTrader 5</p>
                <Badge variant="primary" size="xs">
                  MT5
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Most widely used platform. Supports hedging, netting, and full symbol coverage.
              </p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
              Connect MT5
              <ArrowRight size={12} aria-hidden="true" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('mt4')}
            className="group flex flex-col items-start gap-3 rounded-lg border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Server size={26} aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-slate-900">MetaTrader 4</p>
                <Badge variant="primary" size="xs">
                  MT4
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Classic platform widely used for FX trading. Full support for signals and automation.
              </p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
              Connect MT4
              <ArrowRight size={12} aria-hidden="true" />
            </span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Container>
  );
};

export default ConnectBroker;