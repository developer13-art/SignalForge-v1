import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from 'lucide-react';

const SIZES = {
  sm: 'text-xs px-2 py-1 gap-1',
  md: 'text-sm px-3 py-1.5 gap-1.5',
  lg: 'text-base px-3 py-2 gap-2',
};

const VARIANTS = {
  default: {
    button: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    active: 'border border-indigo-600 bg-indigo-50 text-indigo-700',
  },
  minimal: {
    button: 'border-0 bg-transparent text-slate-600 hover:bg-slate-100',
    active: 'border-0 bg-indigo-100 text-indigo-700',
  },
  pill: {
    button: 'rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    active: 'rounded-full border border-indigo-600 bg-indigo-600 text-white',
  },
};

function nextDirection(current) {
  if (current === 'asc') {
    return 'desc';
  }
  if (current === 'desc') {
    return null;
  }
  return 'asc';
}

const TableSorting = forwardRef(function TableSorting(
  {
    fields = [],
    sort = { key: null, direction: null },
    onChange,
    onReset,
    variant = 'default',
    size = 'md',
    allowReset = true,
    resetLabel = 'Clear sort',
    label = 'Sort by',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeClass = SIZES[size] || SIZES.md;
  const variantConfig = VARIANTS[variant] || VARIANTS.default;

  const activeKey = sort ? sort.key : null;
  const activeDirection = sort ? sort.direction : null;

  const handleClick = useCallback(
    (field) => {
      if (field.disabled) {
        return;
      }

      const isActive = activeKey === field.key;
      const direction = isActive ? nextDirection(activeDirection) : 'asc';
      const nextSort = direction ? { key: field.key, direction } : { key: null, direction: null };

      if (onChange) {
        onChange(nextSort);
      }
    },
    [activeKey, activeDirection, onChange],
  );

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
      return;
    }
    if (onChange) {
      onChange({ key: null, direction: null });
    }
  }, [onReset, onChange]);

  const hasActiveSort = Boolean(activeKey && activeDirection);

  const renderIcon = (field) => {
    const isActive = activeKey === field.key;

    if (!isActive || !activeDirection) {
      return <ChevronsUpDown size={14} className="opacity-60" aria-hidden="true" />;
    }
    if (activeDirection === 'asc') {
      return <ArrowUp size={14} aria-hidden="true" />;
    }
    return <ArrowDown size={14} aria-hidden="true" />;
  };

  return (
    <div
      ref={ref}
      className={['flex flex-wrap items-center gap-2', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {label ? (
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      ) : null}

      {fields.map((field) => {
        const isActive = activeKey === field.key;
        const buttonClass = [
          'inline-flex items-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
          sizeClass,
          isActive ? variantConfig.active : variantConfig.button,
          field.disabled ? 'cursor-not-allowed opacity-50' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={field.key}
            type="button"
            onClick={() => handleClick(field)}
            disabled={field.disabled}
            className={buttonClass}
            aria-label={`Sort by ${field.label}${
              isActive && activeDirection ? ` ${activeDirection}` : ''
            }`}
            aria-pressed={isActive}
          >
            <span>{field.label}</span>
            {renderIcon(field)}
          </button>
        );
      })}

      {allowReset && hasActiveSort ? (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <X size={12} aria-hidden="true" />
          {resetLabel}
        </button>
      ) : null}
    </div>
  );
});

TableSorting.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    }),
  ).isRequired,
  sort: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc', null]),
  }),
  onChange: PropTypes.func,
  onReset: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'minimal', 'pill']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  allowReset: PropTypes.bool,
  resetLabel: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TableSorting;
export { VARIANTS as TABLE_SORTING_VARIANTS };