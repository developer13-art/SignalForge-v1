import React, { forwardRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Phone } from 'lucide-react';

const COUNTRIES = [
  { code: 'NG', dial: '+234', flag: 'NG', name: 'Nigeria' },
  { code: 'US', dial: '+1', flag: 'US', name: 'United States' },
  { code: 'GB', dial: '+44', flag: 'GB', name: 'United Kingdom' },
  { code: 'CA', dial: '+1', flag: 'CA', name: 'Canada' },
  { code: 'ZA', dial: '+27', flag: 'ZA', name: 'South Africa' },
  { code: 'KE', dial: '+254', flag: 'KE', name: 'Kenya' },
  { code: 'GH', dial: '+233', flag: 'GH', name: 'Ghana' },
  { code: 'EG', dial: '+20', flag: 'EG', name: 'Egypt' },
  { code: 'IN', dial: '+91', flag: 'IN', name: 'India' },
  { code: 'DE', dial: '+49', flag: 'DE', name: 'Germany' },
  { code: 'FR', dial: '+33', flag: 'FR', name: 'France' },
  { code: 'ES', dial: '+34', flag: 'ES', name: 'Spain' },
  { code: 'IT', dial: '+39', flag: 'IT', name: 'Italy' },
  { code: 'NL', dial: '+31', flag: 'NL', name: 'Netherlands' },
  { code: 'BR', dial: '+55', flag: 'BR', name: 'Brazil' },
  { code: 'MX', dial: '+52', flag: 'MX', name: 'Mexico' },
  { code: 'AR', dial: '+54', flag: 'AR', name: 'Argentina' },
  { code: 'AU', dial: '+61', flag: 'AU', name: 'Australia' },
  { code: 'JP', dial: '+81', flag: 'JP', name: 'Japan' },
  { code: 'CN', dial: '+86', flag: 'CN', name: 'China' },
  { code: 'SG', dial: '+65', flag: 'SG', name: 'Singapore' },
  { code: 'AE', dial: '+971', flag: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', dial: '+966', flag: 'SA', name: 'Saudi Arabia' },
  { code: 'TR', dial: '+90', flag: 'TR', name: 'Turkey' },
];

const SIZES = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
};

const VARIANTS = {
  default: 'border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-indigo-500',
  error: 'border-rose-400 bg-white focus-within:border-rose-500 focus-within:ring-rose-500',
};

function normalizeDigits(value) {
  return String(value || '').replace(/[^\d\s\-()]/g, '');
}

const PhoneInput = forwardRef(function PhoneInput(
  {
    value = '',
    onChange,
    onBlur,
    country,
    onCountryChange,
    defaultCountry = 'NG',
    placeholder = 'Phone number',
    size = 'md',
    error = false,
    disabled = false,
    required = false,
    showIcon = true,
    countries = COUNTRIES,
    name,
    id,
    className = '',
    inputClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const isCountryControlled = country !== undefined;
  const [internalCountry, setInternalCountry] = useState(defaultCountry);
  const activeCountryCode = isCountryControlled ? country : internalCountry;

  const activeCountry = useMemo(
    () => countries.find((c) => c.code === activeCountryCode) || countries[0],
    [countries, activeCountryCode],
  );

  const handleCountryChange = (event) => {
    const nextCode = event.target.value;
    if (!isCountryControlled) {
      setInternalCountry(nextCode);
    }
    if (onCountryChange) {
      const nextCountry = countries.find((c) => c.code === nextCode);
      onCountryChange(nextCode, nextCountry);
    }
  };

  const handleInputChange = (event) => {
    const raw = event.target.value;
    const digits = normalizeDigits(raw);
    if (onChange) {
      onChange(digits, activeCountry, event);
    }
  };

  const sizeClass = SIZES[size] || SIZES.md;
  const variantClass = error ? VARIANTS.error : VARIANTS.default;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <div
        className={[
          'flex items-stretch overflow-hidden rounded-md border transition-colors focus-within:ring-1',
          variantClass,
          sizeClass,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="relative flex items-center border-r border-slate-200 bg-slate-50">
          <select
            value={activeCountryCode}
            onChange={handleCountryChange}
            disabled={disabled}
            aria-label="Country code"
            className="h-full cursor-pointer appearance-none bg-transparent pl-3 pr-8 text-sm font-medium text-slate-700 focus:outline-none disabled:cursor-not-allowed"
          >
            {countries.map((c) => (
              <option key={`${c.code}-${c.dial}`} value={c.code}>
                {c.flag} {c.dial}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </div>

        {showIcon ? (
          <div className="flex items-center pl-3 pr-1 text-slate-400">
            <Phone size={16} aria-hidden="true" />
          </div>
        ) : null}

        <input
          ref={ref}
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="tel"
          className={[
            'flex-1 bg-transparent px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-500',
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          data-testid={testId}
          {...rest}
        />
      </div>
    </div>
  );
});

PhoneInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  country: PropTypes.string,
  onCountryChange: PropTypes.func,
  defaultCountry: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  showIcon: PropTypes.bool,
  countries: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      dial: PropTypes.string.isRequired,
      flag: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default PhoneInput;
export { COUNTRIES as PHONE_INPUT_COUNTRIES };