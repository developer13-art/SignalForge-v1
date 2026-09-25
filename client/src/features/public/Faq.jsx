import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight, MessageCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const CATEGORIES = [
  {
    title: 'Platform',
    faqs: [
      {
        q: 'What is SignalForge AI?',
        a: 'SignalForge AI is an enterprise-grade trading intelligence platform that ingests signals from multiple sources (Telegram, Discord, WhatsApp, TradingView, email, REST APIs), uses AI to understand and standardize them, applies your risk rules, and executes trades on your MT4/MT5 accounts through a cloud execution layer.',
      },
      {
        q: 'Is SignalForge AI a bot?',
        a: 'No. SignalForge AI is not a bot, a scraper, or a copy script. It is a complete intelligence and control layer with signal understanding, risk decisioning, personalization, execution, analytics, and auditability.',
      },
      {
        q: 'Do I need an expert advisor or VPS?',
        a: 'No. SignalForge AI uses MetaApi to establish a persistent cloud connection to your MT4/MT5 account. No expert advisor, VPS, or local terminal is required.',
      },
      {
        q: 'Which signal sources are supported?',
        a: 'Telegram, Discord, WhatsApp, TradingView webhooks, email (IMAP), and REST API. Telegram uses a User Session model, so providers do not need to add a bot.',
      },
    ],
  },
  {
    title: 'Trading and Execution',
    faqs: [
      {
        q: 'Can I use both demo and live accounts?',
        a: 'Yes. You can connect multiple MT4/MT5 accounts and choose which to use per provider subscription. Demo and live environments are clearly distinguished throughout the platform.',
      },
      {
        q: 'How does the risk engine work?',
        a: 'Every signal runs through configurable per-user risk checks: daily loss, drawdown, sessions, correlation, news, margin, spread, and slippage. If a critical check cannot be completed reliably, the trade is not automatically executed.',
      },
      {
        q: 'What is Provider DNA?',
        a: 'Provider DNA is a learned profile of each provider\'s language, abbreviations, symbol conventions, and trade management habits. It powers the Fast Path (regex + learned rules) and improves accuracy over time.',
      },
      {
        q: 'Can I automate trading rules?',
        a: 'Yes. You can define IF/THEN automation rules such as "IF Profit > $10 THEN Move SL to Breakeven" or "IF Provider Closes THEN Ignore". Rules run after risk approval and before execution.',
      },
    ],
  },
  {
    title: 'KYC and Compliance',
    faqs: [
      {
        q: 'Is KYC required?',
        a: 'Yes. You can register and explore the platform without KYC, but subscribing, connecting a broker account, activating automation, earning referral rewards, or withdrawing funds requires successful KYC verification.',
      },
      {
        q: 'What documents are accepted?',
        a: 'National ID, Voter\'s Card, Driver\'s Licence, International Passport, and other approved identity documents. Document types are admin-configurable to adapt to compliance requirements.',
      },
      {
        q: 'How long does KYC take?',
        a: 'Most verifications complete within minutes. Some require manual review, which typically completes within 1 business day.',
      },
    ],
  },
  {
    title: 'Payments and Referrals',
    faqs: [
      {
        q: 'How does the referral program work?',
        a: 'You earn a reward based on the eligible net trading performance of users you refer. The reward is funded from SignalForge\'s designated referral pool — it is never deducted from the referred user\'s trading profits. The default rate is 0.1% of eligible net profit.',
      },
      {
        q: 'When are referral rewards paid?',
        a: 'Referral rewards are calculated monthly. The settlement process freezes the period, computes eligible net profit, applies the referral rate, runs integrity checks, and credits the referrer wallet.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept card payments through Stripe (global) and Paystack (Africa), plus Solana payments in SOL and USDC.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes. You can cancel at any time. On expiry, automated trading is disabled but you retain full access to accounts, history, and analytics.',
      },
    ],
  },
];

const Faq = function Faq() {
  const navigate = useNavigate();
  const [openItem, setOpenItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);

  const toggle = (key) => {
    setOpenItem(openItem === key ? null : key);
  };

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Help Center
            </Badge>
            <Heading level={1} className="mt-4">
              Frequently asked questions
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              Find answers to the most common questions about the platform, trading, compliance,
              and payments.
            </Text>
          </div>
        </Container>
      </section>

      <section className="bg-white pb-20">
        <Container size="lg">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat, index) => (
              <button
                key={cat.title}
                type="button"
                onClick={() => {
                  setActiveCategory(index);
                  setOpenItem(null);
                }}
                className={[
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  activeCategory === index
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {cat.title}
              </button>
            ))}
          </div>

          <div className="mt-10 space-y-3">
            {CATEGORIES[activeCategory].faqs.map((faq, index) => {
              const key = `${activeCategory}-${index}`;
              const isOpen = openItem === key;

              return (
                <Card key={key} padding="none">
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={[
                        'shrink-0 text-slate-400 transition-transform',
                        isOpen ? 'rotate-180' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen ? (
                    <div className="border-t border-slate-100 px-5 py-4">
                      <p className="text-sm leading-relaxed text-slate-600">{faq.a}</p>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Card padding="lg" variant="subtle">
              <MessageCircle size={24} className="mx-auto text-indigo-600" aria-hidden="true" />
              <Heading level={3} className="mt-3">
                Still have questions?
              </Heading>
              <Text color="muted" className="mt-2">
                Our team is ready to help with anything not covered here.
              </Text>
              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={() => navigate('/contact')}
                  trailingIcon={ArrowRight}
                >
                  Contact Support
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Faq;