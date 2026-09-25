import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individual traders getting started with automated signal execution.',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      '1 connected signal source',
      '1 broker account',
      'Manual and automated trading',
      'Basic risk profile',
      'Standard analytics',
      'Email notifications',
      'Community support',
    ],
    ctaLabel: 'Start Free Trial',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For serious traders running multiple sources and accounts.',
    monthlyPrice: 49,
    yearlyPrice: 490,
    featured: true,
    features: [
      'Up to 5 connected signal sources',
      'Up to 3 broker accounts',
      'Provider DNA learning',
      'Advanced risk engine with custom rules',
      'Full analytics and trade replay',
      'Priority execution',
      'In-app and email notifications',
      'Email support',
    ],
    ctaLabel: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams, IBs, and businesses operating at scale.',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      'Unlimited signal sources and accounts',
      'White label branding and custom domain',
      'Dedicated infrastructure',
      'Affiliate and IB tracking',
      'Executive BI console',
      'Full API access',
      'SLA and priority support',
      'Onboarding and training',
    ],
    ctaLabel: 'Contact Sales',
    custom: true,
  },
];

const FAQS = [
  {
    q: 'Can I change plans later?',
    a: 'Yes. You can upgrade or downgrade your plan at any time from your subscription settings. Upgrades take effect immediately and are prorated for the current period.',
  },
  {
    q: 'What happens if my subscription expires?',
    a: 'Automated trading is disabled, but you retain full access to your connected accounts, signal history, and analytics. You can reactivate at any time.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes. We offer a 14-day money-back guarantee on all paid plans. Contact support for a refund.',
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No. Your subscription covers platform access. Broker commissions and spreads are charged directly by your broker, not by SignalForge.',
  },
];

const Pricing = function Pricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleSelectPlan = (plan) => {
    if (plan.custom) {
      navigate('/contact');
    } else {
      navigate(`/register?plan=${plan.id}&cycle=${billingCycle}`);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Pricing
            </Badge>
            <Heading level={1} className="mt-4">
              Simple, transparent pricing for every trader
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              Start with a 7-day free trial. No credit card required. Cancel anytime.
            </Text>

            <div className="mt-8 inline-flex items-center rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={[
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={[
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  billingCycle === 'yearly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                Yearly
                <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container size="xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const period = billingCycle === 'monthly' ? 'month' : 'year';

              return (
                <Card
                  key={plan.id}
                  padding="lg"
                  variant={plan.featured ? 'elevated' : 'default'}
                  className={[
                    'relative flex flex-col',
                    plan.featured ? 'ring-2 ring-indigo-500' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {plan.featured ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="primary" size="sm">
                        Most Popular
                      </Badge>
                    </div>
                  ) : null}

                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{plan.description}</p>

                  <div className="mt-6">
                    {plan.custom ? (
                      <p className="text-3xl font-bold text-slate-900">Custom</p>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">${price}</span>
                        <span className="text-sm font-medium text-slate-500">/{period}</span>
                      </div>
                    )}
                  </div>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Button
                      variant={plan.featured ? 'primary' : 'outline'}
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full"
                      trailingIcon={ArrowRight}
                    >
                      {plan.ctaLabel}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20">
        <Container size="lg">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2}>Frequently asked questions</Heading>
          </div>

          <div className="mt-10 space-y-4">
            {FAQS.map((faq) => (
              <Card key={faq.q} padding="lg">
                <p className="text-base font-semibold text-slate-900">{faq.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Text color="muted">
              Have a different question?{' '}
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="font-medium text-indigo-600 hover:underline"
              >
                Contact our team
              </button>
            </Text>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Pricing;