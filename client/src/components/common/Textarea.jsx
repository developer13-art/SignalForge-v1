/**
 * Textarea
 *
 * Multiline text input with the same label/helper/error behaviour as
 * Input, plus a live character counter, optional auto-resize, and
 * keyboard shortcuts for submitting and clearing.
 *
 * @module client/src/components/common/Textarea
 */

import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';

const SIZES = {
  sm: 'min-h-[72px] px-3 py-2 text-small rounded-lg',
  md: 'min-h-[104px] px-3.5 py-2.5 text-small rounded-xl',
  lg: 'min-h-[140px] px-4 py-3 text-body rounded-xl',
};

const Textarea = forwardRef(function Textarea(
  {
    id,
    name,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    placeholder,
    label,
    helperText,
    error,
    disabled = false,
    readOnly = false,
    required = false,
    autoFocus = false,
    autoResize = false,
    maxLength,
    minLength,
    rows = 4,
    size = 'md',
    fullWidth = true,
    showCounter = false,
    submitOnEnter = false,
    onSubmit,
    onClear,
    className = '',
    wrapperClassName = '',
    textareaClassName = '',
    ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const textareaId = id || `textarea-${generatedId}`;
  const helperId = helperText ? `${textareaId}-helper` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  const counterId = showCounter ? `${textareaId}-counter` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId, counterId].filter(Boolean).join(' ') || undefined;

  const localRef = useRef(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setRefs = useCallback(
    (node) => {
      localRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const resize = useCallback(() => {
    const node = localRef.current;
    if (!autoResize || !node) {
      return;
    }
    node.style.height = 'auto';
    node.style.height = `${node.scrollHeight}px`;
  }, [autoResize]);

  useEffect(() => {
    resize();
  }, [currentValue, resize]);

  const handleChange = useCallback(
    (event) => {
      if (!isControlled) {
        setInternalValue(event.target.value);
      }
      if (onChange) {
        onChange(event);
      }
      resize();
    },
    [isControlled, onChange, resize],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (submitOnEnter && event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (onSubmit) {
          onSubmit(currentValue);
        }
      }
      if (onKeyDown) {
        onKeyDown(event);
      }
    },
    [currentValue, onKeyDown, onSubmit, submitOnEnter],
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }
    if (onClear) {
      onClear();
    }
    if (onChange) {
      onChange({ target: { name, value: '' } });
    }
  }, [isControlled, name, onChange, onClear]);

  const dimensions = SIZES[size] || SIZES.md;
  const length = String(currentValue || '').length;
  const remaining = typeof maxLength === 'number' ? maxLength - length : null;

  return (
    <div className={clsx(fullWidth && 'w-full', wrapperClassName)}>
      <div className="mb-1.5 flex items-center justify-between">
        {label ? (
          <label htmlFor={textareaId} className="flex items-center gap-1 text-small font-medium text-text-secondary">
            {label}
            {required ? <span className="text-error" aria-hidden="true">*</span> : null}
          </label>
        ) : <span />}

        <div className="flex items-center gap-3">
          {onClear && length > 0 && !disabled && !readOnly ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-caption text-text-tertiary transition hover:text-text-primary"
            >
              Clear
            </button>
          ) : null}
          {showCounter ? (
            <span id={counterId} className={clsx('text-caption', remaining !== null && remaining < 0 ? 'text-error' : 'text-text-tertiary')}>
              {typeof maxLength === 'number' ? `${length}/${maxLength}` : `${length}`}
            </span>
          ) : null}
        </div>
      </div>

      <textarea
        ref={setRefs}
        id={textareaId}
        name={name}
        rows={rows}
        value={isControlled ? value : internalValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoFocus={autoFocus}
        maxLength={maxLength}
        minLength={minLength}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className={clsx(
          'w-full border bg-surface text-text-primary placeholder:text-text-tertiary',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-150',
          'resize-none',
          dimensions,
          error
            ? 'border-error/60 focus:border-error focus:ring-error/25'
            : 'border-surface-border hover:border-surface-hover focus:border-primary-500 focus:ring-primary-500/25',
          disabled && 'opacity-60 cursor-not-allowed',
          readOnly && 'bg-background-subtle',
          textareaClassName,
          className,
        )}
        {...rest}
      />

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

export default Textarea;