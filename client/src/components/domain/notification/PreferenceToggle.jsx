import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const PreferenceToggle = forwardRef(function PreferenceToggle(
  {
    label,
    description,
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const sizes = {
    sm: { toggle: 'h-4 w-7', handle: 'h-3 w-3', translate: 'translate-x-3' },
    md: { toggle: 'h-5 w-9', handle: 'h-4 w-4', translate: 'translate-x-4' },
    lg: { toggle: 'h-6 w-11', handle: 'h-5 w-5', translate: 'translate-x-5' },
  };

  const sizeConfig = sizes[size] || sizes.md;

  return (
    <label
      ref={ref}
      className={[
        'flex cursor-pointer items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50',
        disabled ? 'cursor-not-allowed opacity-60' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>

      <div className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange && onChange(event.target.checked)}
          className="sr-only"
        />
        <div
          className={[
            'relative rounded-full transition-colors',
            sizeConfig.toggle,
            checked ? 'bg-indigo-600' : 'bg-slate-300',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={[
              'absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform',
              sizeConfig.handle,
              checked ? sizeConfig.translate : 'translate-x-0',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </div>
      </div>
    </label>
  );
});

PreferenceToggle.propTypes = {
  label: PropTypes.node,
  description: PropTypes.node,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PreferenceToggle;