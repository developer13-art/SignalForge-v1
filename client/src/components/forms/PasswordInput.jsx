import React, { forwardRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, Lock, Check } from 'lucide-react';

const SIZES = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

const VARIANTS = {
  default: 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500',
  error: 'border-rose-400 bg-white focus:border-rose-500 focus:ring-rose-500',
};

function evaluateStrength(password) {
  if (!password) {
    return { score: 0, label: 'Empty', color: 'slate' };
  }
  let score = 0;
  if (password.length >= 8) {
    score += 1;
  }
  if (password.length >= 12) {
    score += 1;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }
  if (/\d/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (score <= 1) {
    return { score: 1, label: 'Weak', color: 'rose' };
  }
  if (score === 2) {
    return { score: 2, label: 'Fair', color: 'amber' };
  }
  if (score === 3) {
    return { score: 3, label: 'Good', color: 'sky' };
  }
  return { score: 4, label: 'Strong', color: 'emerald' };
}

const COLOR_MAP = {
  slate: { bar: 'bg-slate-200', text: 'text-slate-400' },
  rose: { bar: 'bg-rose-500', text: 'text-rose-600' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-600' },
  sky: { bar: 'bg-sky-500', text: 'text-sky-600' },
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-600' },
};

const PasswordInput = forwardRef(function PasswordInput(
  {
    value = '',
    onChange,
    onBlur,
    placeholder = 'Enter password',
    size = 'md',
    error = false,
    disabled = false,
    required = false,
    showStrength = false,
    showRequirements = false,
    showIcon = true,
    autoComplete = 'new-password',
    name,
    id,
    className = '',
    inputClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const [visible, setVisible] = useState(false);

  const strength = useMemo(() => evaluateStrength(value), [value]);
  const colorConfig = COLOR_MAP[strength.color] || COLOR_MAP.slate;

  const requirements = [
    { label: 'At least 8 characters', met: value.length >= 8 },
    { label: 'Contains uppercase', met: /[A-Z]/.test(value) },
    { label: 'Contains lowercase', met: /[a-z]/.test(value) },
    { label: 'Contains number', met: /\d/.test(value) },
    { label: 'Contains symbol', met: /[^A-Za-z0-9]/.test(value) },
  ];

  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value, event);
    }
  };

  const sizeClass = SIZES[size] || SIZES.md;
  const variantClass = error ? VARIANTS.error : VARIANTS.default;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <div className="relative">
        {showIcon ? (
          <Lock
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        ) : null}

        <input
          ref={ref}
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={[
            'w-full rounded-md border transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            sizeClass,
            variantClass,
            showIcon ? 'pl-9' : '',
            'pr-10',
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          data-testid={testId}
          {...rest}
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>

      {showStrength && value ? (
        <div className="mt-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={[
                  'h-1 flex-1 rounded-full transition-colors',
                  strength.score >= level ? colorConfig.bar : 'bg-slate-200',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>
          <p className={['mt-1 text-[11px] font-medium', colorConfig.text].filter(Boolean).join(' ')}>
            {strength.label}
          </p>
        </div>
      ) : null}

      {showRequirements ? (
        <ul className="mt-2 space-y-1">
          {requirements.map((req) => (
            <li
              key={req.label}
              className={[
                'flex items-center gap-1.5 text-[11px]',
                req.met ? 'text-emerald-600' : 'text-slate-500',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={[
                  'flex h-3 w-3 shrink-0 items-center justify-center rounded-full',
                  req.met ? 'bg-emerald-100' : 'bg-slate-100',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {req.met ? (
                  <Check size={8} className="text-emerald-600" aria-hidden="true" />
                ) : (
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                )}
              </span>
              {req.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});

PasswordInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  showStrength: PropTypes.bool,
  showRequirements: PropTypes.bool,
  showIcon: PropTypes.bool,
  autoComplete: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default PasswordInput;
export { evaluateStrength as evaluatePasswordStrength };