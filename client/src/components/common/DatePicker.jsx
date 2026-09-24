/**
 * DatePicker
 *
 * Custom calendar date picker with month navigation, keyboard
 * accessibility, and range display. Uses the platform's date
 * formatting helpers so that locale is consistent with the rest of
 * the app.
 *
 * @module client/src/components/common/DatePicker
 */

import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';

const SIZES = {
  sm: 'h-9 px-3 text-small rounded-lg',
  md: 'h-11 px-3.5 text-small rounded-xl',
  lg: 'h-12 px-4 text-body rounded-xl',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatDisplay(date, locale = 'en-US') {
  if (!date) {
    return '';
  }
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  } catch (err) {
    return date.toISOString().slice(0, 10);
  }
}

function isSameDay(a, b) {
  if (!a || !b) {
    return false;
  }
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseISO(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const DatePicker = forwardRef(function DatePicker(
  {
    id,
    name,
    value,
    defaultValue,
    onChange,
    placeholder = 'Select date',
    label,
    helperText,
    error,
    disabled = false,
    required = false,
    minDate,
    maxDate,
    size = 'md',
    fullWidth = true,
    clearable = true,
    locale = 'en-US',
    className = '',
    wrapperClassName = '',
    ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || `datepicker-${generatedId}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ') || undefined;

  const parsedMin = useMemo(() => parseISO(minDate), [minDate]);
  const parsedMax = useMemo(() => parseISO(maxDate), [maxDate]);

  const [internalValue, setInternalValue] = useState(parseISO(defaultValue));
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(parseISO(defaultValue) || new Date()));

  const containerRef = useRef(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? parseISO(value) : internalValue;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onDocClick(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        close();
      }
    }
    function onEscape(event) {
      if (event.key === 'Escape') {
        close();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [close, open]);

  const commit = useCallback(
    (next) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      if (onChange) {
        onChange(next);
      }
    },
    [isControlled, onChange],
  );

  const selectDate = useCallback(
    (date) => {
      commit(date);
      close();
    },
    [close, commit],
  );

  const clear = useCallback(
    (event) => {
      event.stopPropagation();
      commit(null);
    },
    [commit],
  );

  const grid = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const last = endOfMonth(viewMonth);
    const startDay = first.getDay();
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  }, [viewMonth]);

  const goToPrevMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goToNextMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const isDisabledDay = (day) => {
    if (!day) {
      return true;
    }
    if (parsedMin && day < new Date(parsedMin.getFullYear(), parsedMin.getMonth(), parsedMin.getDate())) {
      return true;
    }
    if (parsedMax && day > new Date(parsedMax.getFullYear(), parsedMax.getMonth(), parsedMax.getDate())) {
      return true;
    }
    return false;
  };

  const dimensions = SIZES[size] || SIZES.md;

  return (
    <div ref={containerRef} className={clsx('relative', fullWidth && 'w-full', wrapperClassName)}>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1 text-small font-medium text-text-secondary">
          {label}
          {required ? <span className="text-error" aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      <button
        ref={ref}
        id={inputId}
        name={name}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={clsx(
          'flex items-center gap-2 border bg-surface text-left transition-all duration-150',
          dimensions,
          error
            ? 'border-error/60 focus:border-error focus:ring-2 focus:ring-error/25'
            : open
            ? 'border-primary-500 ring-2 ring-primary-500/25'
            : 'border-surface-border hover:border-surface-hover focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
        {...rest}
      >
        <Calendar className="h-4 w-4 shrink-0 text-text-tertiary" />
        <span className={clsx('min-w-0 flex-1 truncate', currentValue ? 'text-text-primary' : 'text-text-tertiary')}>
          {currentValue ? formatDisplay(currentValue, locale) : placeholder}
        </span>
        {clearable && currentValue && !disabled ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={clear}
            className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-md text-text-tertiary transition hover:text-text-primary"
            aria-label="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          className="absolute z-50 mt-1.5 w-72 rounded-xl border border-surface-border bg-surface p-3 shadow-modal animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-small font-semibold text-text-primary">
              {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </p>
            <button
              type="button"
              onClick={goToNextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-caption text-text-tertiary">
            {DAY_LABELS.map((d) => <span key={d}>{d}</span>)}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} />;
              }
              const selected = isSameDay(day, currentValue);
              const disabledDay = isDisabledDay(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => selectDate(day)}
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-small transition',
                    selected
                      ? 'bg-primary text-white'
                      : disabledDay
                      ? 'text-text-tertiary opacity-40 cursor-not-allowed'
                      : 'text-text-primary hover:bg-surface-elevated',
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-surface-border pt-2">
            <button
              type="button"
              onClick={() => selectDate(new Date())}
              className="text-caption text-primary-400 transition hover:text-primary-300"
            >
              Today
            </button>
            {clearable ? (
              <button
                type="button"
                onClick={() => commit(null)}
                className="text-caption text-text-tertiary transition hover:text-text-primary"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-caption text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1.5 text-caption text-text-tertiary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default DatePicker;