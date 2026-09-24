/**
 * Select
 *
 * Accessible custom select built on a button + listbox pattern so
 * that option rendering can include icons, descriptions, and badges
 * that native `<select>` cannot. Handles keyboard navigation
 * (ArrowUp/Down/Home/End/Enter/Escape), typeahead, outside clicks,
 * and grouping.
 *
 * @module client/src/components/common/Select
 */

import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';

const SIZES = {
  sm: 'h-9 px-3 text-small rounded-lg',
  md: 'h-11 px-3.5 text-small rounded-xl',
  lg: 'h-12 px-4 text-body rounded-xl',
};

function normalizeOptions(options) {
  if (!Array.isArray(options)) {
    return [];
  }
  return options.map((option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { value: option, label: String(option) };
    }
    return option;
  });
}

const Select = forwardRef(function Select(
  {
    id,
    name,
    value,
    defaultValue,
    onChange,
    options = [],
    placeholder = 'Select an option',
    label,
    helperText,
    error,
    disabled = false,
    required = false,
    multiple = false,
    searchable = false,
    clearable = false,
    size = 'md',
    fullWidth = true,
    leftIcon: LeftIcon,
    renderOption,
    renderValue,
    className = '',
    wrapperClassName = '',
    ariaDescribedBy,
    onBlur,
    onOpenChange,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;
  const listboxId = `${selectId}-listbox`;
  const helperId = helperText ? `${selectId}-helper` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ') || undefined;

  const list = useMemo(() => normalizeOptions(options), [options]);

  const [internalValue, setInternalValue] = useState(
    defaultValue !== undefined ? defaultValue : multiple ? [] : null,
  );
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const selectedValues = useMemo(() => {
    if (multiple) {
      return Array.isArray(currentValue) ? currentValue : [];
    }
    return currentValue === null || currentValue === undefined ? [] : [currentValue];
  }, [currentValue, multiple]);

  const filteredList = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return list;
    }
    const q = searchQuery.toLowerCase();
    return list.filter((option) => String(option.label || '').toLowerCase().includes(q));
  }, [list, searchQuery, searchable]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setSearchQuery('');
    if (onOpenChange) {
      onOpenChange(false);
    }
    if (onBlur) {
      onBlur();
    }
  }, [onBlur, onOpenChange]);

  const openMenu = useCallback(() => {
    if (disabled) {
      return;
    }
    setOpen(true);
    setHighlightedIndex(0);
    if (onOpenChange) {
      onOpenChange(true);
    }
    if (searchable) {
      requestAnimationFrame(() => {
        if (searchRef.current) {
          searchRef.current.focus();
        }
      });
    }
  }, [disabled, onOpenChange, searchable]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onDocumentClick(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeMenu();
      }
    }
    function onEscape(event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    }
    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [closeMenu, open]);

  const commitValue = useCallback(
    (nextValue) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      if (onChange) {
        onChange(nextValue);
      }
    },
    [isControlled, onChange],
  );

  const handleSelect = useCallback(
    (option) => {
      if (multiple) {
        const exists = selectedValues.includes(option.value);
        const next = exists
          ? selectedValues.filter((v) => v !== option.value)
          : [...selectedValues, option.value];
        commitValue(next);
      } else {
        commitValue(option.value);
        closeMenu();
      }
    },
    [closeMenu, commitValue, multiple, selectedValues],
  );

  const handleClear = useCallback(
    (event) => {
      event.stopPropagation();
      commitValue(multiple ? [] : null);
      setSearchQuery('');
    },
    [commitValue, multiple],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (!open) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
          event.preventDefault();
          openMenu();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((i) => Math.min(i + 1, filteredList.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Home':
          event.preventDefault();
          setHighlightedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setHighlightedIndex(filteredList.length - 1);
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredList[highlightedIndex]) {
            handleSelect(filteredList[highlightedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          closeMenu();
          break;
        default:
          break;
      }
    },
    [closeMenu, filteredList, handleSelect, highlightedIndex, open, openMenu],
  );

  const dimensions = SIZES[size] || SIZES.md;
  const hasValue = selectedValues.length > 0;

  const displayLabel = useMemo(() => {
    if (renderValue) {
      return renderValue({ selectedValues, options: list });
    }
    if (!hasValue) {
      return null;
    }
    if (multiple) {
      return selectedValues
        .map((v) => {
          const found = list.find((o) => o.value === v);
          return found ? found.label : v;
        })
        .join(', ');
    }
    const found = list.find((o) => o.value === selectedValues[0]);
    return found ? found.label : selectedValues[0];
  }, [hasValue, list, multiple, renderValue, selectedValues]);

  return (
    <div ref={containerRef} className={clsx('relative', fullWidth && 'w-full', wrapperClassName)}>
      {label ? (
        <label htmlFor={selectId} className="mb-1.5 flex items-center gap-1 text-small font-medium text-text-secondary">
          {label}
          {required ? <span className="text-error" aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      <button
        ref={ref}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
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
        {LeftIcon ? <LeftIcon className="shrink-0 h-4 w-4 text-text-tertiary" /> : null}
        <span className={clsx('flex-1 min-w-0 truncate', hasValue ? 'text-text-primary' : 'text-text-tertiary')}>
          {hasValue ? displayLabel : placeholder}
        </span>
        {clearable && hasValue && !disabled ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-md text-text-tertiary transition hover:text-text-primary"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <ChevronDown className={clsx('shrink-0 h-4 w-4 text-text-tertiary transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-multiselectable={multiple || undefined}
          className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-surface-border bg-surface shadow-modal animate-fade-in"
        >
          {searchable ? (
            <div className="border-b border-surface-border p-2">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder="Search..."
                className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-small text-text-primary placeholder:text-text-tertiary focus:border-primary-500 focus:outline-none"
              />
            </div>
          ) : null}

          <ul className="max-h-[260px] overflow-y-auto py-1">
            {filteredList.length === 0 ? (
              <li className="px-3 py-4 text-center text-small text-text-tertiary">No options available</li>
            ) : (
              filteredList.map((option, index) => {
                const selected = selectedValues.includes(option.value);
                const highlighted = index === highlightedIndex;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(option)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 text-small cursor-pointer transition',
                      highlighted ? 'bg-surface-elevated' : 'bg-transparent',
                      selected && 'text-primary-300',
                    )}
                  >
                    {option.icon ? <option.icon className="h-4 w-4 text-text-tertiary" /> : null}
                    <div className="min-w-0 flex-1">
                      {renderOption ? (
                        renderOption(option, { selected, highlighted })
                      ) : (
                        <>
                          <p className="text-small truncate text-text-primary">{option.label}</p>
                          {option.description ? (
                            <p className="text-caption truncate text-text-tertiary">{option.description}</p>
                          ) : null}
                        </>
                      )}
                    </div>
                    {selected ? <Check className="h-4 w-4 text-primary-400" /> : null}
                  </li>
                );
              })
            )}
          </ul>
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

export default Select;