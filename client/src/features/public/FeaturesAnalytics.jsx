import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Target,
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
import EquityCurveChart from '../../components/charts/EquityCurveChart';

const METRICS = [
  { icon: TrendingUp, label: 'Equity Curve', description: 'Full account equity over time, replayable for every trade.' },
  { icon: BarChart3, label: 'Profit Factor', description: 'Gross profit divided by gross loss, computed in real time.' },
  { icon: Target, label: 'Win Rate', description: 'Win, loss, and breakeven trades with breakdowns by symbol and provider.' },
  { icon: Activity, label: 'Sharpe and Sortino', description: 'Risk-adjusted performance ratios computed on realized trades.' },
  { icon: Clock, label: 'Execution Latency', description: 'Signal to broker round trip, with p50, p95, and max latency.' },
  { icon: Layers, label: 'Behavior Analysis', description: 'Detect martingale, grid, recovery trading, and news exposure patterns.' },
];

const SAMPLE_DATA = [
  { date: 'Week 1', equity: 10000 },
  { date: 'Week 2', equity: 10650 },
  { date: 'Week 3', equity: 11200 },
  { date: 'Week 4', equity: 10850 },
  { date: 'Week 5', equity: 11900 },
  { date: 'Week 6', equity: 12750 },
  { date: 'Week 7', equity: 13100 },
  { date: 'Week 8', equity: 14500 },
];

const FeaturesAnalytics = function FeaturesAnalytics() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-violet-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Analytics and Performance
            </Badge>
            <Heading level={1} className="mt-4">
              Real-time analytics for every trade, provider, and account
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              SignalForge AI computes performance metrics in real time and stores the full
              lifecycle of every trade — replayable end to end for audit and dispute resolution.
            </Text>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <Card padding="lg" variant="elevated">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Equity Curve
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">$14,500.00</p>
                  <p className="mt-0.5 text-xs font-semibold text-emerald-600">+45% this quarter</p>
                </div>
                <Badge variant="success" size="sm">
                  Live
                </Badge>
              </div>

              <div className="mt-4">
                <EquityCurveChart
                  data={SAMPLE_DATA}
                  xKey="date"
                  dataKey="equity"
                  height={240}
                  showBaseline={false}
                  valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </div>
            </Card>

            <div>
              <Heading level={2}>Complete visibility into performance</Heading>
              <Text size="lg" color="muted" className="mt-4">
                From equity curves to execution latency, every metric is computed in the platform
                and never depends on the broker gateway.
              </Text>

              <div className="mt-6 space-y-3">
                {[
                  'Real-time updates via WebSocket',
                  'Filter by provider, symbol, account, or date range',
                  'Export reports as PDF or CSV',
                  'Behavior analysis detects martingale and grid patterns',
                  'Provider and trader performance comparisons',
                  'Full trade replay from signal to close',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  variant="primary"
                  onClick={() => navigate('/register')}
                  trailingIcon={ArrowRight}
                >
                  Explore Analytics
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2}>Metrics and reports</Heading>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{metric.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {metric.description}
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
              Data you can trust
            </Heading>
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                trailingIcon={ArrowRight}
              >
                Get Started
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default FeaturesAnalytics;