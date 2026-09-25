import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Server, Shield, Zap, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Stepper from '../../components/common/Stepper';
import FormField from '../../components/forms/FormField';
import NumberInput from '../../components/forms/NumberInput';
import CurrencyInput from '../../components/forms/CurrencyInput';
import Alert from '../../components/feedback/Alert';

const STEPS = [
  { key: 'source', label: 'Signal Source', icon: Radio },
  { key: 'broker', label: 'Broker Account', icon: Server },
  { key: 'risk', label: 'Risk Profile', icon: Shield },
  { key: 'complete', label: 'Ready', icon: Zap },
];

const SOURCE_TYPES = [
  { value: 'telegram', label: 'Telegram', description: 'Connect your Telegram account and select channels to monitor.' },
  { value: 'discord', label: 'Discord', description: 'Connect to Discord and select servers and channels.' },
  { value: 'tradingview', label: 'TradingView', description: 'Receive alerts via webhook from TradingView strategies.' },
  { value: 'rest_api', label: 'REST API', description: 'Direct signal submission through the SignalForge API.' },
  { value: 'email', label: 'Email', description: 'Forward signals from any email inbox.' },
  { value: 'skip', label: 'Set up later', description: 'Skip this step and configure sources from settings.' },
];

const BROKER_PLATFORMS = [
  { value: 'mt5', label: 'MetaTrader 5' },
  { value: 'mt4', label: 'MetaTrader 4' },
];

const OnboardingFlow = function OnboardingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sourceType, setSourceType] = useState('');
  const [brokerPlatform, setBrokerPlatform] = useState('mt5');
  const [accountType, setAccountType] = useState('demo');
  const [riskConfig, setRiskConfig] = useState({
    riskPercent: 1,
    maxDailyLoss: 500,
    maxOpenTrades: 5,
  });

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((prev) => prev + 1);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  }, [step]);

  const handleFinish = useCallback(async () => {
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sourceType,
          brokerPlatform,
          accountType,
          riskConfig,
        }),
      });
    } catch (_err) {
      // continue to complete page regardless
    }
    navigate('/onboarding/complete');
  }, [sourceType, brokerPlatform, accountType, riskConfig, navigate]);

  return (
    <Container size="lg" className="py-12">
      <div className="mb-8">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <Card padding="lg" variant="elevated">
        {step === 0 ? (
          <div>
            <Heading level={2}>Choose a signal source</Heading>
            <Text color="muted" className="mt-2">
              Pick the type of source you want to connect first. You can add more later.
            </Text>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SOURCE_TYPES.map((source) => {
                const isSelected = sourceType === source.value;
                return (
                  <button
                    key={source.value}
                    type="button"
                    onClick={() => setSourceType(source.value)}
                    className={[
                      'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{source.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{source.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <Heading level={2}>Connect your broker account</Heading>
            <Text color="muted" className="mt-2">
              Choose your platform and account type. You can add real account credentials from
              your broker settings.
            </Text>

            <div className="mt-6 space-y-4">
              <FormField label="Trading Platform" required>
                <div className="flex gap-2">
                  {BROKER_PLATFORMS.map((platform) => {
                    const isActive = brokerPlatform === platform.value;
                    return (
                      <button
                        key={platform.value}
                        type="button"
                        onClick={() => setBrokerPlatform(platform.value)}
                        className={[
                          'flex-1 rounded-md border-2 px-4 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {platform.label}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              <FormField label="Account Type" required>
                <div className="flex gap-2">
                  {['demo', 'live'].map((type) => {
                    const isActive = accountType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        className={[
                          'flex-1 rounded-md border-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors',
                          isActive
                            ? type === 'live'
                              ? 'border-rose-500 bg-rose-50 text-rose-700'
                              : 'border-sky-500 bg-sky-50 text-sky-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              {accountType === 'live' ? (
                <Alert variant="warning" size="sm">
                  <p className="text-xs font-semibold">Live accounts require KYC verification</p>
                  <p className="mt-1 text-xs">
                    You will be prompted to complete identity verification before activating live
                    trading.
                  </p>
                </Alert>
              ) : null}

              <Alert variant="info" size="sm">
                <p className="text-xs">
                  Your broker credentials are encrypted and stored securely. SignalForge never
                  sends them directly from the browser. MetaApi validates and connects your
                  account on the platform's behalf.
                </p>
              </Alert>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <Heading level={2}>Set your risk profile</Heading>
            <Text color="muted" className="mt-2">
              These values apply to every automated trade. You can adjust them later.
            </Text>

            <div className="mt-6 space-y-4">
              <FormField
                label="Risk Per Trade (%)"
                description="Percentage of account balance risked per trade"
              >
                {({ id }) => (
                  <NumberInput
                    id={id}
                    value={riskConfig.riskPercent}
                    onChange={(value) =>
                      setRiskConfig((prev) => ({ ...prev, riskPercent: Number(value) || 0 }))
                    }
                    min={0.1}
                    max={10}
                    step={0.1}
                    precision={2}
                  />
                )}
              </FormField>

              <FormField
                label="Max Daily Loss"
                description="Automated trading stops if daily loss exceeds this amount"
              >
                {() => (
                  <CurrencyInput
                    value={riskConfig.maxDailyLoss}
                    onChange={(value) =>
                      setRiskConfig((prev) => ({ ...prev, maxDailyLoss: Number(value) || 0 }))
                    }
                    currency="USD"
                  />
                )}
              </FormField>

              <FormField
                label="Max Open Trades"
                description="Total concurrent positions allowed"
              >
                {({ id }) => (
                  <NumberInput
                    id={id}
                    value={riskConfig.maxOpenTrades}
                    onChange={(value) =>
                      setRiskConfig((prev) => ({ ...prev, maxOpenTrades: Number(value) || 0 }))
                    }
                    min={1}
                    max={100}
                    step={1}
                    precision={0}
                  />
                )}
              </FormField>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} aria-hidden="true" />
            </div>
            <Heading level={2} className="mt-6">
              You&apos;re all set
            </Heading>
            <Text color="muted" className="mt-2 mx-auto max-w-md">
              Your trading intelligence platform is ready. You can continue to the dashboard now
              and connect real credentials any time.
            </Text>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            leadingIcon={ArrowLeft}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              trailingIcon={ChevronRight}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleFinish}
              trailingIcon={CheckCircle2}
            >
              Finish Setup
            </Button>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default OnboardingFlow;