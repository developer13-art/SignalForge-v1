import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Check, ChevronDown, Search, X } from 'lucide-react';

const SIZES = {
  sm: { trigger: 'min-h-8 px-2 py-1 text-xs', chip: 'text-[10px] px-1.5 py-0.5', icon: 14 },
  md: { trigger: 'min-h-10 px-3 py-1.5 text-sm', chip: 'text-xs px-2 py-0.5', icon: 16 },
  lg: { trigger: 'min-h-12 px-4 py-2 text-base', chip: 'text-sm px-2.5 py-1', icon: 18 },
};

const VARIANTS = {
  default: 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500',
  error: 'border-rose-400 bg-white focus:border-rose-500 focus:ring-rose-500',
};

const MultiSelect = forwardRef(function MultiSelect(
  {
    value = [],
    onChange,
    options = [],
    placeholder = 'Select options',
    searchPlaceholder = 'Search',
    emptyMessage = 'No options found',
    size = 'md',
    variant = 'default',
    error = false,
    disabled = false,
    searchable = true,
    clearable = true,
    maxDisplay,
    maxSelected,
    searchAccessor,
    getOptionValue = (option) => option.value,
    getOptionLabel = (option) => option.label,
    getOptionDescription,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const itemRefs = useRef([]);

  const selectedValues = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  const selectedOptions = useMemo(
    () =>
      options.filter((option) => selectedValues.includes(getOptionValue(option))),
    [options, selectedValues, getOptionValue],
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.trim().toLowerCase();
    return options.filter((option) => {
      const label = String(getOptionLabel(option) || '').toLowerCase();
      const description = getOptionDescription
        ? String(getOptionDescription(option) || '').toLowerCase()
        : '';
      const searchText = searchAccessor ? String(searchAccessor(option) || '').toLowerCase() : '';
      return label.includes(query) || description.includes(query) || searchText.includes(query);
    });
  }, [options, searchQuery, getOptionLabel, getOptionDescription, searchAccessor]);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    } else if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const toggleOption = useCallback(
    (option) => {
      const optValue = getOptionValue(option);
      const isSelected = selectedValues.includes(optValue);
      let next;

      if (isSelected) {
        next = selectedValues.filter((v) => v !== optValue);
      } else {
        if (maxSelected && selectedValues.length >= maxSelected) {
          return;
        }
        next = [...selectedValues, optValue];
      }

      if (onChange) {
        const nextOptions = options.filter((o) => next.includes(getOptionValue(o)));
        onChange(next, nextOptions);
      }
    },
    [selectedValues, maxSelected, onChange, options, getOptionValue],
  );

  const removeOption = useCallback(
    (optionValue) => {
      const next = selectedValues.filter((v) => v !== optionValue);
      if (onChange) {
        const nextOptions = options.filter((o) => next.includes(getOptionValue(o)));
        onChange(next, nextOptions);
      }
    },
    [selectedValues, onChange, options, getOptionValue],
  );

  const clearAll = useCallback(
    (event) => {
      event.stopPropagation();
      if (onChange) {
        onChange([], []);
      }
    },
    [onChange],
  );

  const handleKeyDown = (event) => {
    if (!open) {
      if (event.key === 'Enter' || event.key === 'ArrowDown' || event.key === ' ') {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        toggleOption(filteredOptions[highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Backspace' && !searchQuery && selectedOptions.length > 0) {
      removeOption(getOptionValue(selectedOptions[selectedOptions.length - 1]));
    }
  };

  const displaySelected = useMemo(() => {
    if (maxDisplay && selectedOptions.length > maxDisplay) {
      return selectedOptions.slice(0, maxDisplay);
    }
    return selectedOptions;
  }, [selectedOptions, maxDisplay]);

  const remainingCount = maxDisplay && selectedOptions.length > maxDisplay
    ? selectedOptions.length - maxDisplay
    : 0;

  const sizeConfig = SIZES[size] || SIZES.md;
  const variantClass = variant === 'error' || error ? VARIANTS.error : VARIANTS.default;

  return (
    <div ref={containerRef} className={['relative w-full', className].filter(Boolean).join(' ')} data-testid={testId} {...rest}>
      <div
        ref={ref}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={[
          'flex w-full flex-wrap items-center gap-1 rounded-md border cursor-pointer transition-colors focus:outline-none focus:ring-1',
          sizeConfig.trigger,
          variantClass,
          disabled ? 'cursor-not-allowed bg-slate-50 opacity-60' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {selectedOptions.length === 0 ? (
          <span className="flex-1 py-0.5 text-slate-400">{placeholder}</span>
        ) : (
          <>
            {displaySelected.map((option) => (
              <span
                key={getOptionValue(option)}
                className={[
                  'inline-flex items-center gap-1 rounded bg-indigo-50 font-medium text-indigo-700',
                  sizeConfig.chip,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {getOptionLabel(option)}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeOption(getOptionValue(option));
                  }}
                  className="rounded-full text-indigo-500 hover:bg-indigo-200 hover:text-indigo-900"
                  aria-label={`Remove ${getOptionLabel(option)}`}
                >
                  <X size={sizeConfig.icon - 4} aria-hidden="true" />
                </button>
              </span>
            ))}
            {remainingCount > 0 ? (
              <span className={['rounded bg-slate-100 font-medium text-slate-600', sizeConfig.chip].filter(Boolean).join(' ')}>
                +{remainingCount}
              </span>
            ) : null}
          </>
        )}

        <div className="ml-auto flex items-center gap-1">
          {clearable && selectedOptions.length > 0 && !disabled ? (
            <button
              type="button"
              onClick={clearAll}
              aria-label="Clear selection"
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={sizeConfig.icon - 2} aria-hidden="true" />
            </button>
          ) : null}
          <ChevronDown
            size={sizeConfig.icon}
            className={['text-slate-400 transition-transform', open ? 'rotate-180' : ''].filter(Boolean).join(' ')}
            aria-hidden="true"
          />
        </div>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
              <Search size={14} className="text-slate-400" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          ) : null}

          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-slate-400">{emptyMessage}</li>
            ) : (
              filteredOptions.map((option, index) => {
                const optValue = getOptionValue(option);
                const isSelected = selectedValues.includes(optValue);
                const isHighlighted = index === highlightedIndex;
                const description = getOptionDescription ? getOptionDescription(option) : null;

                return (
                  <li
                    key={optValue}
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    role="option"
                    aria-selected={isSelected}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleOption(option);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={[
                      'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
                      isHighlighted ? 'bg-slate-50' : '',
                      isSelected ? 'text-indigo-700' : 'text-slate-700',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span
                      className={[
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {isSelected ? <Check size={12} className="text-white" aria-hidden="true" /> : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{getOptionLabel(option)}</span>
                      {description ? (
                        <span className="block truncate text-xs text-slate-500">{description}</span>
                      ) : null}
                    </span>
                  </li>
                );
              })
            )}
          </ul>

          {maxSelected && selectedOptions.length >= maxSelected ? (
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500">
              Maximum {maxSelected} selections reached
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

MultiSelect.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  emptyMessage: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'error']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  searchable: PropTypes.bool,
  clearable: PropTypes.bool,
  maxDisplay: PropTypes.number,
  maxSelected: PropTypes.number,
  searchAccessor: PropTypes.func,
  getOptionValue: PropTypes.func,
  getOptionLabel: PropTypes.func,
  getOptionDescription: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default MultiSelect;