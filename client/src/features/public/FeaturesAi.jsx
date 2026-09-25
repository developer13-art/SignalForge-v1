import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Award,
  Languages,
  Sparkles,
  ShieldCheck,
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

const CAPABILITIES = [
  {
    icon: Brain,
    title: 'Intent Extraction',
    description:
      'Detects the trading intent from free-form messages regardless of phrasing or formatting.',
  },
  {
    icon: Languages,
    title: 'Multi-Language Support',
    description:
      'Understands Portuguese, Spanish, French, Arabic, Hindi, and other languages without configuration.',
  },
  {
    icon: Award,
    title: 'Provider DNA Learning',
    description:
      'Learns each provider\'s unique style — abbreviations, symbols, and management habits — over time.',
  },
  {
    icon: Sparkles,
    title: 'Confidence Scoring',
    description:
      'Every parse returns a confidence score. Low confidence messages are flagged for review, never auto-executed.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety Filters',
    description:
      'Prompt injection protection, content filtering, and structured output validation on every AI request.',
  },
  {
    icon: Layers,
    title: 'Fast and Learning Paths',
    description:
      'Known patterns resolve instantly via regex and DNA rules; novel patterns use full AI inference.',
  },
];

const PARSING_EXAMPLES = [
  {
    input: 'Buy Gold now, SL 3350, TP 3360 and 3375',
    output: `{
  "action": "BUY",
  "symbol": "XAUUSD",
  "entry_type": "MARKET",
  "stop_loss": 3350,
  "take_profits": [3360, 3375]
}`,
  },
  {
    input: 'EURUSD LONG @ 1.1050 Stop 1.1020 Target 1.1110',
    output: `{
  "action": "BUY",
  "symbol": "EURUSD",
  "entry_type": "LIMIT",
  "entry": 1.1050,
  "stop_loss": 1.1020,
  "take_profits": [1.1110]
}`,
  },
  {
    input: 'Vender ouro agora',
    output: `{
  "action": "SELL",
  "symbol": "XAUUSD",
  "entry_type": "MARKET"
}`,
  },
];

const FeaturesAi = function FeaturesAi() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-indigo-50 to-white py-20">
        <Container size="xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="primary" size="sm">
                AI Signal Intelligence
              </Badge>
              <Heading level={1} className="mt-4">
                Understand any provider, in any language, in any format
              </Heading>
              <Text size="lg" color="muted" className="mt-4">
                SignalForge AI does not require providers to use a specific format. It learns their
                style, resolves ambiguities, and produces a standardized trade object — with a
                confidence score and full audit trail.
              </Text>

              <ul className="mt-6 space-y-3">
                {[
                  'Free-form parsing from any message format',
                  'Provider DNA learning improves accuracy over time',
                  'Fast path for known patterns, learning path for novel ones',
                  'Every parse includes a confidence score',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  variant="primary"
                  onClick={() => navigate('/register')}
                  trailingIcon={ArrowRight}
                >
                  Try It Free
                </Button>
              </div>
            </div>

            <Card padding="lg" variant="elevated">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Brain size={16} className="text-indigo-600" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-900">AI Parser</p>
                <Badge variant="success" size="xs" className="ml-auto">
                  Confidence 96%
                </Badge>
              </div>

              <div className="mt-4 space-y-3">
                {PARSING_EXAMPLES.map((example, index) => (
                  <div key={index} className="space-y-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Input
                      </p>
                      <p className="mt-1 text-xs text-slate-700">{example.input}</p>
                    </div>
                    <CodeBlock
                      code={example.output}
                      language="json"
                      size="sm"
                      showCopy={false}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2}>Capabilities</Heading>
            <Text size="lg" color="muted" className="mt-4">
              Every layer designed to keep signal intelligence accurate, safe, and auditable.
            </Text>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <Card key={cap.title} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
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

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              See AI signal parsing in your own channels
            </Heading>
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                trailingIcon={ArrowRight}
              >
                Create Account
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default FeaturesAi;