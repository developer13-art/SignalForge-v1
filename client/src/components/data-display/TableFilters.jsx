import React, { forwardRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Filter, X, ChevronDown } from 'lucide-react';

const TableFilters = forwardRef(function TableFilters(
  {
    filters = [],
    values = {},
    onChange,
    onReset,
    variant = 'inline',
    showReset = true,
    resetLabel = 'Reset',
    title,
    collapsible = false,
    defaultCollapsed = false,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const activeCount = useMemo(() => {
    return Object.values(values || {}).filter((value) => {
      if (value === null || value === undefined || value === '') {
        return false;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return true;
    }).length;
  }, [values]);

  const handleChange = (key, value) => {
    if (onChange) {
      onChange({ ...values, [key]: value });
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else if (onChange) {
      const resetValues = {};
      filters.forEach((filter) => {
        resetValues[filter.key] = filter.defaultValue ?? '';
      });
      onChange(resetValues);
    }
  };

  const renderFilter = (filter) => {
    const value = values[filter.key] ?? filter.defaultValue ?? '';

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(event) => handleChange(filter.key, event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label={filter.label}
          >
            {filter.placeholder ? (
              <option value="">{filter.placeholder}</option>
            ) : null}
            {(filter.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect': {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-1">
            {(filter.options || []).map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleChange(
                      filter.key,
                      isSelected
                        ? selectedValues.filter((v) => v !== option.value)
                        : [...selectedValues, option.value],
                    )
                  }
                  className={[
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        );
      }

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(event) => handleChange(filter.key, event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label={filter.label}
          />
        );

      case 'daterange': {
        const rangeValue = Array.isArray(value) ? value : ['', ''];
        return (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={rangeValue[0] || ''}
              onChange={(event) => handleChange(filter.key, [event.target.value, rangeValue[1]])}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label={`${filter.label} start`}
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={rangeValue[1] || ''}
              onChange={(event) => handleChange(filter.key, [rangeValue[0], event.target.value])}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label={`${filter.label} end`}
            />
          </div>
        );
      }

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value}
            placeholder={filter.placeholder || filter.label}
            onChange={(event) => handleChange(filter.key, event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label={filter.label}
          />
        );
    }
  };

  const filterElements = filters.map((filter) => (
    <div key={filter.key} className="flex flex-col gap-1">
      {variant === 'block' || variant === 'stacked' ? (
        <label className="text-xs font-medium text-slate-600">{filter.label}</label>
      ) : null}
      {renderFilter(filter)}
    </div>
  ));

  if (variant === 'toolbar') {
    return (
      <div
        ref={ref}
        className={['flex flex-wrap items-center gap-2', className].filter(Boolean).join(' ')}
        data-testid={testId}
        {...rest}
      >
        <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600">
          <Filter size={14} className="text-slate-400" aria-hidden="true" />
          <span className="font-medium">{title || 'Filters'}</span>
          {activeCount > 0 ? (
            <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 px-1.5 text-[10px] font-semibold text-indigo-700">
              {activeCount}
            </span>
          ) : null}
        </div>

        {filterElements}

        {showReset && activeCount > 0 ? (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={12} aria-hidden="true" />
            {resetLabel}
          </button>
        ) : null}
      </div>
    );
  }

  if (collapsible) {
    return (
      <div
        ref={ref}
        className={['rounded-lg border border-slate-200 bg-white', className]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <span className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" aria-hidden="true" />
            {title || 'Filters'}
            {activeCount > 0 ? (
              <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 px-1.5 text-[10px] font-semibold text-indigo-700">
                {activeCount}
              </span>
            ) : null}
          </span>
          <ChevronDown
            size={16}
            className={[
              'text-slate-400 transition-transform',
              collapsed ? 'rotate-0' : 'rotate-180',
            ].join(' ')}
            aria-hidden="true"
          />
        </button>

        {!collapsed ? (
          <div className="flex flex-wrap items-end gap-3 border-t border-slate-200 px-4 py-3">
            {filterElements}
            {showReset && activeCount > 0 ? (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={12} aria-hidden="true" />
                {resetLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={['flex flex-wrap items-end gap-3', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {filterElements}

      {showReset && activeCount > 0 ? (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
        >
          <X size={12} aria-hidden="true" />
          {resetLabel}
        </button>
      ) : null}
    </div>
  );
});

TableFilters.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'select', 'multiselect', 'date', 'daterange']),
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }),
      ),
      placeholder: PropTypes.string,
      defaultValue: PropTypes.any,
    }),
  ).isRequired,
  values: PropTypes.object,
  onChange: PropTypes.func,
  onReset: PropTypes.func,
  variant: PropTypes.oneOf(['inline', 'toolbar', 'block', 'stacked']),
  showReset: PropTypes.bool,
  resetLabel: PropTypes.string,
  title: PropTypes.string,
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TableFilters;