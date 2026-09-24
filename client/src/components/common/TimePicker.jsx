/**
 * TimePicker
 *
 * Fully controlled time input with 12/24-hour support, minute step
 * configuration, keyboard navigation, and a scrollable hour/minute
 * column layout. Renders a native input on mobile and a custom
 * dropdown on desktop.
 *
 * @module client/src/components/common/TimePicker
 */

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import clsx from 'clsx';

function pad(value) {
  return String(value).padStart(2, '0');
}

function parseValue(value) {
  if (!value || typeof value !== 'string') {
    return { hour: 0, minute: 0 };
  }
  const [h, m] = value.split(':').map((v) => Number(v));
  return {
    hour: Number.isFinite(h) ? h : 0,
    minute: Number.isFinite(m) ? m : 0,
  };
}

function formatValue({ hour, minute, use24Hour }) {
  if (use24Hour) {
    return `${pad(hour)}:${pad(minute)}`;
  }
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${pad(h12)}:${pad(minute)} ${suffix}`;
}

export const TimePicker = forwardRef(function TimePicker(
  {
    id,
    name,
    label,
    value = '00:00',
    onChange,
    onBlur,
    disabled = false,
    readOnly = false,
    required = false,
    error,
    hint,
    use24Hour = true,
    minuteStep = 1,
    minuteInterval,
    placeholder = 'Select time',
    className,
    inputClassName,
    dropdownClassName,
    minTime,
    maxTime,
    openOnFocus = true,
    disablePast = false,
    clearable = false,
    'aria-label': ariaLabel,
  },
  forwardedRef,
) {
  const interval = minuteInterval || minuteStep;
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const parsed = parseValue(value);
  const [draft, setDraft] = useState({ ...parsed, use24Hour });

  useEffect(() => {
    setDraft({ ...parseValue(value), use24Hour });
  }, [value, use24Hour]);

  useEffect(() => {
    function handleOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const hours = useMemo(() => {
    const list = [];
    for (let h = 0; h < 24; h++) {
      list.push(h);
    }
    return list;
  }, []);

  const minutes = useMemo(() => {
    const list = [];
    for (let m = 0; m < 60; m += interval) {
      list.push(m);
    }
    return list;
  }, [interval]);

  const isTimeDisabled = useCallback(
    (hour, minute) => {
      const target = hour * 60 + minute;
      if (minTime) {
        const [h, m] = minTime.split(':').map(Number);
        if (target < h * 60 + m) return true;
      }
      if (maxTime) {
        const [h, m] = maxTime.split(':').map(Number);
        if (target > h * 60 + m) return true;
      }
      if (disablePast) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        if (target < nowMinutes) return true;
      }
      return false;
    },
    [minTime, maxTime, disablePast],
  );

  const commit = useCallback(
    (hour, minute) => {
      const nextValue = `${pad(hour)}:${pad(minute)}`;
      if (onChange) {
        onChange(nextValue);
      }
      setOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (disabled || readOnly) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
      }
    },
    [disabled, readOnly],
  );

  const display = value ? formatValue({ ...parsed, use24Hour }) : placeholder;

  return (
    <div ref={containerRef} className={clsx('relative w-full', className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-small font-medium text-text-secondary">
          {label}
          {required ? <span className="ml-1 text-error">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <button
          type="button"
          id={id}
          name={name}
          ref={forwardedRef}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={ariaLabel || label}
          onClick={() => !disabled && !readOnly && setOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          onFocus={() => openOnFocus && !disabled && !readOnly && setOpen(true)}
          onBlur={onBlur}
          className={clsx(
            'flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-surface px-3.5 text-left text-small transition',
            error
              ? 'border-error/60 text-text-primary focus:border-error'
              : 'border-surface-border text-text-primary focus:border-primary-500',
            disabled && 'cursor-not-allowed opacity-50',
            readOnly && 'cursor-default',
            inputClassName,
          )}
        >
          <span className={clsx('truncate', !value && 'text-text-tertiary')}>{display}</span>
          <Clock className="h-4 w-4 shrink-0 text-text-tertiary" />
        </button>

        {clearable && value && !disabled && !readOnly ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (onChange) onChange('');
            }}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-text-tertiary transition hover:text-text-primary"
            aria-label="Clear time"
          >
            ×
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          className={clsx(
            'absolute left-0 top-[calc(100%+6px)] z-40 w-full overflow-hidden rounded-xl border border-surface-border bg-surface shadow-modal animate-fade-in',
            dropdownClassName,
          )}
        >
          <div className="grid grid-cols-2 divide-x divide-surface-border">
            <div className="max-h-56 overflow-y-auto p-1.5">
              {hours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => commit(hour, draft.minute)}
                  disabled={isTimeDisabled(hour, draft.minute)}
                  className={clsx(
                    'flex w-full items-center justify-center rounded-lg px-2 py-1.5 text-small transition',
                    hour === draft.hour
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                    isTimeDisabled(hour, draft.minute) && 'cursor-not-allowed opacity-30',
                  )}
                >
                  {pad(hour)}
                </button>
              ))}
            </div>
            <div className="max-h-56 overflow-y-auto p-1.5">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => commit(draft.hour, minute)}
                  disabled={isTimeDisabled(draft.hour, minute)}
                  className={clsx(
                    'flex w-full items-center justify-center rounded-lg px-2 py-1.5 text-small transition',
                    minute === draft.minute
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                    isTimeDisabled(draft.hour, minute) && 'cursor-not-allowed opacity-30',
                  )}
                >
                  {pad(minute)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-1.5 text-caption text-error">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-caption text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
});

export default TimePicker;