import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

const SidebarGroup = forwardRef(function SidebarGroup(
  {
    label,
    icon: Icon,
    children,
    defaultOpen = true,
    open: controlledOpen,
    onOpenChange,
    collapsible = true,
    count,
    hideLabel = false,
    className = '',
    labelClassName = '',
    itemsClassName = '',
    testId,
    ...rest
  },
  ref
) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : internalOpen;

  const toggle = () => {
    if (!collapsible) {
      return;
    }
    if (!isControlled) {
      setInternalOpen((prev) => !prev);
    }
    if (onOpenChange) {
      onOpenChange(!open);
    }
  };

  const hasHeader = Boolean(label) || Boolean(Icon);

  return (
    <div
      ref={ref}
      className={['mb-4', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {hasHeader && !hideLabel ? (
        collapsible ? (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className={[
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-100/60',
              labelClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {Icon ? <Icon size={14} className="shrink-0 text-slate-400" aria-hidden="true" /> : null}
            <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {label}
            </span>
            {count !== undefined ? (
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                {count}
              </span>
            ) : null}
            <ChevronDown
              size={12}
              className={[
                'text-slate-400 transition-transform',
                open ? 'rotate-0' : '-rotate-90',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            />
          </button>
        ) : (
          <div
            className={[
              'flex items-center gap-2 px-2 py-1.5',
              labelClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {Icon ? <Icon size={14} className="shrink-0 text-slate-400" aria-hidden="true" /> : null}
            <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {label}
            </span>
            {count !== undefined ? (
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                {count}
              </span>
            ) : null}
          </div>
        )
      ) : null}

      {open ? (
        <div className={['mt-1 space-y-0.5', itemsClassName].filter(Boolean).join(' ')}>
          {children}
        </div>
      ) : null}
    </div>
  );
});

SidebarGroup.propTypes = {
  label: PropTypes.node,
  icon: PropTypes.elementType,
  children: PropTypes.node,
  defaultOpen: PropTypes.bool,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  collapsible: PropTypes.bool,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hideLabel: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  itemsClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default SidebarGroup;