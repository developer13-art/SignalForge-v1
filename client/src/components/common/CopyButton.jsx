import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, Copy } from 'lucide-react';

const SIZES = {
  xs: { button: 'h-6 w-6', icon: 12 },
  sm: { button: 'h-7 w-7', icon: 14 },
  md: { button: 'h-9 w-9', icon: 16 },
  lg: { button: 'h-10 w-10', icon: 18 },
};

const VARIANTS = {
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
  solid: 'bg-slate-900 text-white hover:bg-slate-800',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
};

const CopyButton = forwardRef(function CopyButton(
  {
    value,
    label = 'Copy',
    copiedLabel = 'Copied',
    icon = Copy,
    successIcon = Check,
    size = 'md',
    variant = 'ghost',
    showLabel = false,
    resetDelay = 2000,
    onCopy,
    onError,
    disabled = false,
    className = '',
    labelClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const handleCopy = useCallback(
    async (event) => {
      if (disabled) {
        return;
      }

      const text = typeof value === 'function' ? value() : value;

      if (text === undefined || text === null) {
        return;
      }

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(String(text));
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = String(text);
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          textarea.style.pointerEvents = 'none';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        setCopied(true);

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          setCopied(false);
        }, resetDelay);

        if (onCopy) {
          onCopy(text, event);
        }
      } catch (error) {
        if (onError) {
          onError(error, event);
        }
      }
    },
    [value, disabled, resetDelay, onCopy, onError],
  );

  const sizeConfig = SIZES[size] || SIZES.md;
  const variantClass = VARIANTS[variant] || VARIANTS.ghost;
  const Icon = copied ? successIcon : icon;

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        showLabel ? 'px-3 py-2 text-sm font-medium' : sizeConfig.button,
        variantClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <Icon size={sizeConfig.icon} aria-hidden="true" />
      {showLabel ? (
        <span className={labelClassName}>{copied ? copiedLabel : label}</span>
      ) : (
        <span className="sr-only">{copied ? copiedLabel : label}</span>
      )}
    </button>
  );
});

CopyButton.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  label: PropTypes.string,
  copiedLabel: PropTypes.string,
  icon: PropTypes.elementType,
  successIcon: PropTypes.elementType,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['ghost', 'solid', 'outline', 'primary']),
  showLabel: PropTypes.bool,
  resetDelay: PropTypes.number,
  onCopy: PropTypes.func,
  onError: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default CopyButton;
export { SIZES as COPY_BUTTON_SIZES, VARIANTS as COPY_BUTTON_VARIANTS };