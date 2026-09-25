import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Webhook,
  Shield,
  Zap,
  Database,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import CodeBlock from '../../components/data-display/CodeBlock';

const SAMPLE_SIGNAL = `POST /api/v1/provider/signal
Authorization: Bearer sf_live_...
Content-Type: application/json

{
  "symbol": "EURUSD",
  "action": "BUY",
  "entry_type": "MARKET",
  "stop_loss": 1.1020,
  "take_profits": [1.1110, 1.1150],
  "provider_reference": "your-signal-id-12345"
}`;

const SAMPLE_RESPONSE = `{
  "success": true,
  "data": {
    "signal_id": "sig_9a8f4c2e",
    "status": "received",
    "validation": {
      "confidence": 0.96,
      "classified_as": "new_trade"
    },
    "processing": {
      "stage": "risk_evaluation",
      "subscribers_affected": 248
    }
  }
}`;

const CAPABILITIES = [
  {
    icon: Zap,
    title: 'Direct Signal Submission',
    description:
      'Submit signals directly through the REST API without relying on messaging sources.',
  },
  {
    icon: Webhook,
    title: 'Webhook Events',
    description:
      'Subscribe to signal, trade, subscription, and payment events through signed webhooks.',
  },
  {
    icon: Shield,
    title: 'Secure API Keys',
    description:
      'Hashed API keys with per-key permissions, rate limits, and expiry.',
  },
  {
    icon: Database,
    title: 'Full Data Access',
    description:
      'Query signals, trades, positions, performance, and analytics through the API.',
  },
  {
    icon: Layers,
    title: 'Structured Payloads',
    description:
      'Every request and response uses versioned, documented schemas.',
  },
  {
    icon: Code2,
    title: 'SDKs and Examples',
    description:
      'Official client examples in JavaScript, Python, and cURL for every endpoint.',
  },
];

const ApiPlatform = function ApiPlatform() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-20 text-white">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              API Platform
            </Badge>
            <Heading level={1} color="white" className="mt-4">
              Build with SignalForge AI
            </Heading>
            <Text size="lg" className="mt-4 text-slate-300">
              Submit signals, subscribe to events, and access full platform data through a
              versioned REST API.
            </Text>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/register')}
                trailingIcon={ArrowRight}
              >
                Get API Access
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/contact')}
                className="!border-slate-700 !text-slate-200 hover:!bg-slate-800"
              >
                Talk to Engineering
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2}>Everything exposed through a documented API</Heading>
            <Text size="lg" color="muted" className="mt-4">
              Every action in the platform is available programmatically.
            </Text>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <Card key={cap.title} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {cap.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20">
        <Container size="xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card padding="lg">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Submit a Signal
              </p>
              <CodeBlock
                code={SAMPLE_SIGNAL}
                language="http"
                size="sm"
                showLineNumbers
              />
            </Card>

            <Card padding="lg">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Response
              </p>
              <CodeBlock
                code={SAMPLE_RESPONSE}
                language="json"
                size="sm"
                showLineNumbers
              />
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              'Predictable endpoints and versioning',
              'Idempotent requests with idempotency keys',
              'Signed webhook payloads for verification',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700"
              >
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                {item}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              Ready to integrate?
            </Heading>
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                trailingIcon={ArrowRight}
              >
                Create API Key
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ApiPlatform;