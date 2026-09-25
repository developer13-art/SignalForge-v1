import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Shield, AlertTriangle, Clock, Zap } from 'lucide-react';
import Form from '../../forms/Form';
import FormField from '../../forms/FormField';
import CurrencyInput from '../../forms/CurrencyInput';
import NumberInput from '../../forms/NumberInput';
import Button from '../../common/Button';
import Separator from '../../common/Separator';
import Alert from '../../feedback/Alert';

const RiskProfileForm = forwardRef(function RiskProfileForm(
  {
    defaultValues,
    onSubmit,
    onCancel,
    submitting = false,
    error,
    currency = 'USD',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const validate = (values) => {
    const errors = {};

    const riskPercent = Number(values.riskPercent);
    if (values.riskPercent === '' || values.riskPercent === undefined) {
      errors.riskPercent = 'Risk percent is required';
    } else if (riskPercent < 0.1 || riskPercent > 10) {
      errors.riskPercent = 'Risk percent must be between 0.1 and 10';
    }

    const maxDailyLoss = Number(values.maxDailyLoss);
    if (values.maxDailyLoss === '' || values.maxDailyLoss === undefined) {
      errors.maxDailyLoss = 'Maximum daily loss is required';
    } else if (maxDailyLoss <= 0) {
      errors.maxDailyLoss = 'Must be greater than zero';
    }

    const maxOpenTrades = Number(values.maxOpenTrades);
    if (values.maxOpenTrades === '' || values.maxOpenTrades === undefined) {
      errors.maxOpenTrades = 'Maximum open trades is required';
    } else if (maxOpenTrades < 1 || maxOpenTrades > 100) {
      errors.maxOpenTrades = 'Must be between 1 and 100';
    }

    return errors;
  };

  return (
    <Form
      ref={ref}
      initialValues={
        defaultValues || {
          riskPercent: 1,
          maxDailyLoss: 500,
          maxDrawdown: 20,
          maxOpenTrades: 5,
          tradingStartTime: '08:00',
          tradingEndTime: '20:00',
          trailingStop: true,
          breakEven: true,
          newsFilter: false,
          correlationProtection: false,
        }
      }
      validate={validate}
      onSubmit={onSubmit}
      className={['space-y-5', className].filter(Boolean).join(' ')}
      testId={testId}
      {...rest}
    >
      {error ? (
        <Alert variant="danger" size="sm">
          {typeof error === 'string' ? error : error.message}
        </Alert>
      ) : null}

      <Alert variant="info" size="sm">
        <p className="text-xs">
          These settings apply to all automated trades. Changes take effect immediately for new
          signals — existing positions are unaffected.
        </p>
      </Alert>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Shield size={14} aria-hidden="true" />
          Position Sizing
        </h3>
        <Separator spacing="sm" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="riskPercent"
            label="Risk Per Trade (%)"
            required
            description="Percentage of account balance risked per trade"
          >
            {({ value, onChange, id, name }) => (
              <NumberInput
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                min={0.1}
                max={10}
                step={0.1}
                precision={2}
              />
            )}
          </FormField>

          <FormField
            name="maxOpenTrades"
            label="Max Open Trades"
            required
            description="Total concurrent positions allowed"
          >
            {({ value, onChange, id, name }) => (
              <NumberInput
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                min={1}
                max={100}
                step={1}
                precision={0}
              />
            )}
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <AlertTriangle size={14} aria-hidden="true" />
          Loss Limits
        </h3>
        <Separator spacing="sm" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="maxDailyLoss"
            label="Max Daily Loss"
            required
            description={`Automated trading stops if daily loss exceeds this (${currency})`}
          >
            {({ value, onChange, id, name }) => (
              <CurrencyInput
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                currency={currency}
              />
            )}
          </FormField>

          <FormField
            name="maxDrawdown"
            label="Max Drawdown (%)"
            description="Emergency stop if account drawdown exceeds this"
          >
            {({ value, onChange, id, name }) => (
              <NumberInput
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                min={1}
                max={100}
                step={1}
                precision={0}
              />
            )}
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Clock size={14} aria-hidden="true" />
          Trading Sessions
        </h3>
        <Separator spacing="sm" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField name="tradingStartTime" label="Session Start">
            {({ value, onChange, id, name }) => (
              <input
                id={id}
                name={name}
                type="time"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </FormField>

          <FormField name="tradingEndTime" label="Session End">
            {({ value, onChange, id, name }) => (
              <input
                id={id}
                name={name}
                type="time"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Zap size={14} aria-hidden="true" />
          Automatic Protections
        </h3>
        <Separator spacing="sm" />

        <div className="space-y-3">
          {[
            { key: 'trailingStop', label: 'Trailing Stop', description: 'Automatically trail stop loss as profit grows' },
            { key: 'breakEven', label: 'Break Even', description: 'Move stop loss to break even at preset profit' },
            { key: 'newsFilter', label: 'News Filter', description: 'Pause trading during high-impact news events' },
            {
              key: 'correlationProtection',
              label: 'Correlation Protection',
              description: 'Prevent opening highly correlated positions',
            },
          ].map((item) => (
            <FormField key={item.key} name={item.key} showLabel={false}>
              {({ value, onChange, id, name }) => (
                <label
                  htmlFor={id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
                >
                  <input
                    id={id}
                    name={name}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => onChange(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                  </div>
                </label>
              )}
            </FormField>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Risk Profile'}
        </Button>
      </div>
    </Form>
  );
});

RiskProfileForm.propTypes = {
  defaultValues: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  currency: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RiskProfileForm;