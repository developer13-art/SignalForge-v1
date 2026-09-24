import React, {
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

const Accordion = forwardRef(function Accordion(
  {
    items = [],
    allowMultiple = false,
    defaultOpenKeys = [],
    controlledOpenKeys,
    onOpenChange,
    variant = 'default',
    size = 'md',
    className = '',
    itemClassName = '',
    headerClassName = '',
    contentClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const isControlled = controlledOpenKeys !== undefined;
  const [internalOpenKeys, setInternalOpenKeys] = useState(
    Array.isArray(defaultOpenKeys) ? defaultOpenKeys : [],
  );

  const openKeys = isControlled ? controlledOpenKeys : internalOpenKeys;

  const openSet = useMemo(() => new Set(openKeys), [openKeys]);

  const setOpenKeys = useCallback(
    (nextKeys) => {
      if (!isControlled) {
        setInternalOpenKeys(nextKeys);
      }
      if (onOpenChange) {
        onOpenChange(nextKeys);
      }
    },
    [isControlled, onOpenChange],
  );

  const toggle = useCallback(
    (key) => {
      const isOpen = openSet.has(key);
      let nextKeys;

      if (isOpen) {
        nextKeys = openKeys.filter((k) => k !== key);
      } else {
        nextKeys = allowMultiple ? [...openKeys, key] : [key];
      }

      setOpenKeys(nextKeys);
    },
    [openSet, openKeys, allowMultiple, setOpenKeys],
  );

  const variantClasses = {
    default: {
      container: 'divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white',
      header: 'hover:bg-slate-50',
    },
    separated: {
      container: 'space-y-3',
      header: 'rounded-lg border border-slate-200 bg-white hover:bg-slate-50',
    },
    ghost: {
      container: '',
      header: 'hover:bg-slate-50 rounded-lg',
    },
  };

  const sizeClasses = {
    sm: {
      header: 'px-3 py-2.5 text-sm',
      content: 'px-3 pb-3 text-xs',
      icon: 14,
    },
    md: {
      header: 'px-4 py-3 text-sm',
      content: 'px-4 pb-4 text-sm',
      icon: 16,
    },
    lg: {
      header: 'px-5 py-4 text-base',
      content: 'px-5 pb-5 text-sm',
      icon: 18,
    },
  };

  const variantConfig = variantClasses[variant] || variantClasses.default;
  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      ref={ref}
      className={[variantConfig.container, className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {items.map((item) => {
        const isOpen = openSet.has(item.key);
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className={[
              variant === 'separated' ? 'overflow-hidden rounded-lg border border-slate-200 bg-white' : '',
              itemClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button
              type="button"
              onClick={() => {
                if (!item.disabled) {
                  toggle(item.key);
                }
              }}
              disabled={item.disabled}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.key}`}
              id={`accordion-header-${item.key}`}
              className={[
                'flex w-full items-center justify-between gap-3 text-left font-medium text-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                sizeConfig.header,
                variantConfig.header,
                item.disabled ? 'cursor-not-allowed opacity-50' : '',
                headerClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="flex items-center gap-3">
                {Icon ? (
                  <Icon
                    size={sizeConfig.icon}
                    className="shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                ) : null}
                <span>{item.title}</span>
              </span>

              <ChevronDown
                size={sizeConfig.icon}
                className={[
                  'shrink-0 text-slate-400 transition-transform duration-200',
                  isOpen ? 'rotate-180' : 'rotate-0',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              />
            </button>

            {isOpen ? (
              <div
                id={`accordion-panel-${item.key}`}
                role="region"
                aria-labelledby={`accordion-header-${item.key}`}
                className={[
                  'overflow-hidden text-slate-600',
                  sizeConfig.content,
                  contentClassName,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.content}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});

Accordion.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.node.isRequired,
      content: PropTypes.node,
      icon: PropTypes.elementType,
      disabled: PropTypes.bool,
    }),
  ).isRequired,
  allowMultiple: PropTypes.bool,
  defaultOpenKeys: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
  controlledOpenKeys: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
  onOpenChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'separated', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Accordion;