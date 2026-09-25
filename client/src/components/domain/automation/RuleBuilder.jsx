import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, Trash2, Zap, ArrowRight } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import Button from '../../common/Button';
import FormField from '../../forms/FormField';
import NumberInput from '../../forms/NumberInput';
import CurrencyInput from '../../forms/CurrencyInput';

const TRIGGER_OPTIONS = [
  { value: 'profit_above', label: 'Profit is above', unit: 'currency' },
  { value: 'profit_below', label: 'Profit is below', unit: 'currency' },
  { value: 'profit_percent_above', label: 'Profit % is above', unit: 'percent' },
  { value: 'loss_above', label: 'Loss is above', unit: 'currency' },
  { value: 'time_elapsed', label: 'Time elapsed (minutes)', unit: 'number' },
  { value: 'price_above', label: 'Price is above', unit: 'number' },
  { value: 'price_below', label: 'Price is below', unit: 'number' },
];

const ACTION_OPTIONS = [
  { value: 'move_sl_breakeven', label: 'Move stop loss to break even' },
  { value: 'move_sl_to', label: 'Move stop loss to price', unit: 'number' },
  { value: 'trailing_stop', label: 'Activate trailing stop', unit: 'number' },
  { value: 'partial_close', label: 'Close partial position', unit: 'percent' },
  { value: 'close_position', label: 'Close entire position' },
  { value: 'close_all', label: 'Close all positions' },
  { value: 'disable_trading', label: 'Disable trading on this account' },
];

const RuleBuilder = forwardRef(function RuleBuilder(
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
  const [name, setName] = useState(defaultValues?.name || '');
  const [trigger, setTrigger] = useState(defaultValues?.trigger || 'profit_above');
  const [triggerValue, setTriggerValue] = useState(defaultValues?.triggerValue || '');
  const [action, setAction] = useState(defaultValues?.action || 'move_sl_breakeven');
  const [actionValue, setActionValue] = useState(defaultValues?.actionValue || '');
  const [enabled, setEnabled] = useState(defaultValues?.enabled !== false);
  const [priority, setPriority] = useState(defaultValues?.priority || 1);
  const [errors, setErrors] = useState({});

  const triggerConfig = useMemo(
    () => TRIGGER_OPTIONS.find((t) => t.value === trigger),
    [trigger]
  );
  const actionConfig = useMemo(
    () => ACTION_OPTIONS.find((a) => a.value === action),
    [action]
  );

  const validate = useCallback(() => {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Rule name is required';
    }

    if (triggerConfig && triggerConfig.unit && (triggerValue === '' || triggerValue === undefined)) {
      nextErrors.triggerValue = 'Trigger value is required';
    }

    if (actionConfig && actionConfig.unit && (actionValue === '' || actionValue === undefined)) {
      nextErrors.actionValue = 'Action value is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [name, triggerConfig, triggerValue, actionConfig, actionValue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    if (onSubmit) {
      onSubmit({
        name: name.trim(),
        trigger,
        triggerValue: triggerValue === '' ? undefined : Number(triggerValue),
        action,
        actionValue: actionValue === '' ? undefined : Number(actionValue),
        enabled,
        priority,
      });
    }
  };

  const renderValueInput = (config, value, onChange, errorKey) => {
    if (!config || !config.unit) {
      return null;
    }

    if (config.unit === 'currency') {
      return (
        <FormField label="Value" error={errors[errorKey]}>
          {() => (
            <CurrencyInput
              value={value}
              onChange={onChange}
              currency={currency}
              min={0}
            />
          )}
        </FormField>
      );
    }

    if (config.unit === 'percent') {
      return (
        <FormField label="Value (%)" error={errors[errorKey]}>
          {({ id }) => (
            <NumberInput
              id={id}
              value={value}
              onChange={onChange}
              min={0}
              max={100}
              step={1}
              precision={0}
            />
          )}
        </FormField>
      );
    }

    return (
      <FormField label="Value" error={errors[errorKey]}>
        {({ id }) => (
          <NumberInput
            id={id}
            value={value}
            onChange={onChange}
            min={0}
            step={1}
          />
        )}
      </FormField>
    );
  };

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className={['space-y-5', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {typeof error === 'string' ? error : error.message}
        </div>
      ) : null}

      <Card padding="md" variant="subtle">
        <FormField label="Rule Name" error={errors.name} required>
          {({ id }) => (
            <input
              id={id}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Move SL to breakeven at $10 profit"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </FormField>

        <div className="mt-4">
          <FormField label="Priority" description="Lower number runs first">
            {({ id }) => (
              <NumberInput
                id={id}
                value={priority}
                onChange={(value) => setPriority(Number(value) || 1)}
                min={1}
                max={100}
                step={1}
                precision={0}
              />
            )}
          </FormField>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Enable this rule immediately</span>
        </label>
      </Card>

      <Card padding="md">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
            1
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Trigger</h3>
        </div>

        <Separator spacing="sm" />

        <FormField label="When">
          <select
            value={trigger}
            onChange={(event) => setTrigger(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {TRIGGER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        {triggerConfig && triggerConfig.unit ? (
          <div className="mt-4">
            {renderValueInput(triggerConfig, triggerValue, setTriggerValue, 'triggerValue')}
          </div>
        ) : null}
      </Card>

      <div className="flex justify-center">
        <ArrowRight size={20} className="text-slate-300" aria-hidden="true" />
      </div>

      <Card padding="md">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
            2
          </span>
          <h3 className="text-sm font-semibold text-slate-800">Action</h3>
        </div>

        <Separator spacing="sm" />

        <FormField label="Then">
          <select
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        {actionConfig && actionConfig.unit ? (
          <div className="mt-4">
            {renderValueInput(actionConfig, actionValue, setActionValue, 'actionValue')}
          </div>
        ) : null}
      </Card>

      <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={submitting} leadingIcon={Zap}>
          {submitting ? 'Saving...' : 'Save Rule'}
        </Button>
      </div>
    </form>
  );
});

RuleBuilder.propTypes = {
  defaultValues: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  currency: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RuleBuilder;
export { TRIGGER_OPTIONS as RULE_TRIGGER_OPTIONS, ACTION_OPTIONS as RULE_ACTION_OPTIONS };