import React, { forwardRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Wallet, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Alert from '../../feedback/Alert';

const SiwsLoginButton = forwardRef(function SiwsLoginButton(
  {
    onSignIn,
    onCancel,
    disabled = false,
    size = 'md',
    label = 'Sign In With Solana',
    error,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [state, setState] = useState('idle');
  const [localError, setLocalError] = useState(null);

  const sizeClass =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs gap-1.5'
      : size === 'lg'
      ? 'px-5 py-2.5 text-base gap-2.5'
      : 'px-4 py-2 text-sm gap-2';

  const handleClick = useCallback(async () => {
    if (disabled || state === 'signing') {
      return;
    }

    setLocalError(null);
    setState('signing');

    try {
      if (onSignIn) {
        await onSignIn();
      }
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setLocalError(err?.message || 'Sign in failed');
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }, [disabled, state, onSignIn]);

  const displayError = error || localError;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')} data-testid={testId} {...rest}>
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={disabled || state === 'signing'}
        className={[
          'inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-violet-600 to-purple-600 font-semibold text-white transition-colors hover:from-violet-700 hover:to-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          sizeClass,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {state === 'signing' ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : state === 'success' ? (
          <CheckCircle2 size={16} aria-hidden="true" />
        ) : state === 'error' ? (
          <XCircle size={16} aria-hidden="true" />
        ) : (
          <Wallet size={16} aria-hidden="true" />
        )}
        {state === 'signing'
          ? 'Waiting for signature...'
          : state === 'success'
          ? 'Signed in'
          : state === 'error'
          ? 'Sign in failed'
          : label}
      </button>

      {displayError ? (
        <Alert variant="danger" size="sm" className="mt-2">
          {typeof displayError === 'string' ? displayError : displayError.message}
        </Alert>
      ) : null}

      {onCancel && state === 'signing' ? (
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
});

SiwsLoginButton.propTypes = {
  onSignIn: PropTypes.func,
  onCancel: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SiwsLoginButton;