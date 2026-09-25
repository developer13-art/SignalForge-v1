import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Radio, Send, MessageSquare, MessageCircle, Webhook, Code2, Mail } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';

const SOURCE_TYPES = [
  {
    key: 'telegram',
    label: 'Telegram',
    description: 'Connect your Telegram account and monitor specific channels.',
    icon: Send,
    href: '/sources/telegram',
  },
  {
    key: 'discord',
    label: 'Discord',
    description: 'Connect to Discord and monitor servers and channels.',
    icon: MessageSquare,
    href: '/sources/discord',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    description: 'Connect WhatsApp Business or monitor groups.',
    icon: MessageCircle,
    href: '/sources/whatsapp',
  },
  {
    key: 'tradingview',
    label: 'TradingView',
    description: 'Receive alerts from TradingView via webhook.',
    icon: Webhook,
    href: '/sources/tradingview',
  },
  {
    key: 'rest_api',
    label: 'REST API',
    description: 'Direct signal submission through the platform API.',
    icon: Code2,
    href: '/sources/rest-api',
  },
  {
    key: 'email',
    label: 'Email',
    description: 'Forward signals from any email inbox.',
    icon: Mail,
    href: '/sources/email',
  },
];

const AddSignalSource = function AddSignalSource() {
  const navigate = useNavigate();

  const handleBack = useCallback(() => navigate('/sources'), [navigate]);

  const handleSelect = useCallback(
    (source) => {
      navigate(source.href);
    },
    [navigate],
  );

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Radio size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Add Signal Source
            </Heading>
            <Text color="muted" className="text-xs">
              Choose the type of source you want to connect
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SOURCE_TYPES.map((source) => {
            const Icon = source.icon;
            return (
              <button
                key={source.key}
                type="button"
                onClick={() => handleSelect(source)}
                className="flex flex-col items-start gap-3 rounded-lg border-2 border-slate-200 bg-white p-5 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{source.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{source.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </Container>
  );
};

export default AddSignalSource;