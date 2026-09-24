import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Search, X, Loader2 } from 'lucide-react';

const SIZES = {
  sm: { input: 'h-8 text-xs pl-8 pr-7', icon: 14, clear: 12, leftPos: 'left-2.5' },
  md: { input: 'h-10 text-sm pl-9 pr-9', icon: 16, clear: 14, leftPos: 'left-3' },
  lg: { input: 'h-12 text-base pl-11 pr-11', icon: 18, clear: 16, leftPos: 'left-3.5' },
};

const VARIANTS = {
  default: 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500',
  filled: 'border-transparent bg-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500',
  error: 'border-rose-400 bg-white focus:border-rose-500 focus:ring-rose-500',
};

const SearchInput = forwardRef(function SearchInput(
  {
    value = '',
    onChange,
    onSearch,
    onClear,
    onBlur,
    placeholder = 'Search',
    size = 'md',
    variant = 'default',
    error = false,
    disabled = false,
    loading = false,
    debounceMs,
    showClear = true,
    autoFocus = false,
    name,
    id,
    className = '',
    inputClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const [internalValue, setInternalValue] = useState(value);
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;

  const debounceRef = useRef(null);

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value);
    }
  }, [isControlled, value]);

  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  const emitChange = useCallback(
    (nextValue, event) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      if (onChange) {
        onChange(nextValue, event);
      }

      if (debounceMs && onSearch) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          onSearch(nextValue);
        }, debounceMs);
      }
    },
    [isControlled, onChange, debounceMs, onSearch],
  );

  const handleChange = (event) => {
    emitChange(event.target.value, event);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && onSearch) {
      event.preventDefault();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      onSearch(activeValue);
    }
    if (event.key === 'Escape' && activeValue) {
      event.preventDefault();
      handleClear(event);
    }
  };

  const handleClear = (event) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!isControlled) {
      setInternalValue('');
    }
    if (onChange) {
      onChange('', event);
    }
    if (onClear) {
      onClear(event);
    }
  };

  const sizeConfig = SIZES[size] || SIZES.md;
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  return (
    <div className={['relative w-full', className].filter(Boolean).join(' ')}>
      <Search
        size={sizeConfig.icon}
        className={['pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400', sizeConfig.leftPos]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />

      <input
        ref={ref}
        id={id}
        name={name}
        type="search"
        value={activeValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        className={[
          'w-full rounded-md border transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          sizeConfig.input,
          variantClass,
          error ? VARIANTS.error : '',
          inputClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      />

      {loading ? (
        <Loader2
          size={sizeConfig.clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
          aria-hidden="true"
        />
      ) : showClear && activeValue ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={sizeConfig.clear} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'filled', 'error']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  debounceMs: PropTypes.number,
  showClear: PropTypes.bool,
  autoFocus: PropTypes.bool,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default SearchInput;