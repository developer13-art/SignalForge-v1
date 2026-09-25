import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Server, KeyRound, User, Shield, Globe, Info } from 'lucide-react';
import Form from '../../forms/Form';
import FormField from '../../forms/FormField';
import FormActions from '../../forms/FormActions';
import PasswordInput from '../../forms/PasswordInput';
import Button from '../../common/Button';
import Alert from '../../feedback/Alert';

const PLATFORMS = [
  { value: 'mt4', label: 'MetaTrader 4' },
  { value: 'mt5', label: 'MetaTrader 5' },
];

const ACCOUNT_TYPES = [
  { value: 'live', label: 'Live' },
  { value: 'demo', label: 'Demo' },
];

const BrokerConnectForm = forwardRef(function BrokerConnectForm(
  {
    brokers = [],
    defaultValues,
    onSubmit,
    onCancel,
    submitting = false,
    error,
    showAccountType = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [serverInfo, setServerInfo] = useState(null);

  const validate = (values) => {
    const errors = {};

    if (!values.broker) {
      errors.broker = 'Please select a broker';
    }
    if (!values.platform) {
      errors.platform = 'Please select a platform';
    }
    if (!values.server) {
      errors.server = 'Please enter the server name';
    }
    if (!values.login) {
      errors.login = 'Please enter your login number';
    } else if (!/^\d+$/.test(String(values.login))) {
      errors.login = 'Login must be numeric';
    }
    if (!values.password) {
      errors.password = 'Please enter your password';
    }
    if (!values.nickname) {
      errors.nickname = 'Please enter a nickname for this account';
    }

    return errors;
  };

  const handleSubmit = (values) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  const handleBrokerChange = (brokerId) => {
    const broker = brokers.find((b) => b.id === brokerId || b.name === brokerId);
    setServerInfo(broker);
  };

  return (
    <Form
      ref={ref}
      initialValues={
        defaultValues || {
          broker: '',
          platform: 'mt5',
          accountType: 'live',
          server: '',
          login: '',
          password: '',
          nickname: '',
        }
      }
      validate={validate}
      onSubmit={handleSubmit}
      className={['space-y-4', className].filter(Boolean).join(' ')}
      testId={testId}
      {...rest}
    >
      {error ? (
        <Alert variant="danger" title="Connection Error">
          {typeof error === 'string' ? error : error.message || 'Failed to connect broker account'}
        </Alert>
      ) : null}

      <FormField name="broker" label="Broker" required>
        <select
          name="broker"
          onChange={(event) => handleBrokerChange(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select a broker</option>
          {brokers.map((broker) => (
            <option key={broker.id || broker.name} value={broker.id || broker.name}>
              {broker.name}
            </option>
          ))}
        </select>
      </FormField>

      {serverInfo && serverInfo.servers && serverInfo.servers.length > 0 ? (
        <div className="rounded-md border border-sky-200 bg-sky-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-sky-900">
            <Info size={12} aria-hidden="true" />
            Available servers for this broker
          </p>
          <p className="mt-1 text-xs text-sky-800">
            {serverInfo.servers.join(', ')}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField name="platform" label="Platform" required>
          <select
            name="platform"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {PLATFORMS.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </FormField>

        {showAccountType ? (
          <FormField name="accountType" label="Account Type" required>
            <select
              name="accountType"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}
      </div>

      <FormField
        name="server"
        label="Server"
        required
        description="The exact MT4/MT5 server name for this broker"
      >
        {({ value, onChange, name, id }) => (
          <div className="relative">
            <Globe
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id={id}
              name={name}
              type="text"
              value={value || ''}
              onChange={(event) => onChange(event.target.value)}
              placeholder="e.g. Exness-MT5Real8"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </FormField>

      <FormField name="login" label="Login Number" required>
        {({ value, onChange, name, id }) => (
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id={id}
              name={name}
              type="text"
              inputMode="numeric"
              value={value || ''}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Your MT4/MT5 account number"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </FormField>

      <FormField
        name="password"
        label="Password"
        required
        description="Your trading password — used only to connect your account"
      >
        {({ value, onChange, onBlur, name, id }) => (
          <PasswordInput
            id={id}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="Your MT4/MT5 password"
            showStrength={false}
            autoComplete="current-password"
          />
        )}
      </FormField>

      <FormField
        name="nickname"
        label="Account Nickname"
        required
        description="A friendly name for this account in your dashboard"
      >
        {({ value, onChange, name, id }) => (
          <input
            id={id}
            name={name}
            type="text"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="e.g. My Exness Live"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        )}
      </FormField>

      <Alert variant="info" size="sm">
        <p className="text-xs">
          Your credentials are encrypted and stored securely. We never send them directly from the
          browser. MetaApi validates your account and establishes a persistent cloud connection
          without requiring any expert advisor or VPS.
        </p>
      </Alert>

      <FormActions>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          leadingIcon={Shield}
        >
          {submitting ? 'Connecting...' : 'Connect Account'}
        </Button>
      </FormActions>
    </Form>
  );
});

BrokerConnectForm.propTypes = {
  brokers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      servers: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  defaultValues: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  submitting: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  showAccountType: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default BrokerConnectForm;