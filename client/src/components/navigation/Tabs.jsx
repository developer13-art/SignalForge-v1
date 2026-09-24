import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  underline: {
    list: 'border-b border-slate-200 gap-1',
    tab: 'border-b-2 -mb-px transition-colors',
    active: 'border-indigo-600 text-indigo-600',
    inactive: 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
    panel: 'pt-4',
  },
  pill: {
    list: 'inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1',
    tab: 'rounded-md transition-colors',
    active: 'bg-white text-slate-900 shadow-sm',
    inactive: 'text-slate-600 hover:text-slate-900',
    panel: 'pt-4',
  },
  enclosed: {
    list: 'border-b border-slate-200 gap-1',
    tab: 'rounded-t-md border border-transparent transition-colors',
    active: 'border-slate-200 border-b-white bg-white text-slate-900 -mb-px',
    inactive: 'text-slate-500 hover:text-slate-800',
    panel: 'pt-4',
  },
  minimal: {
    list: 'gap-4',
    tab: 'transition-colors',
    active: 'text-slate-900 font-semibold',
    inactive: 'text-slate-500 hover:text-slate-700',
    panel: 'pt-4',
  },
};

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Tabs = forwardRef(function Tabs(
  {
    tabs = [],
    value,
    defaultValue,
    onChange,
    variant = 'underline',
    size = 'md',
    fullWidth = false,
    className = '',
    listClassName = '',
    tabClassName = '',
    panelClassName = '',
    keepMounted = false,
    testId,
    ...rest
  },
  ref
) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue || (tabs[0]?.value ?? null));
  const activeValue = isControlled ? value : internalValue;

  const tabRefs = useRef({});

  const handleSelect = useCallback(
    (nextValue, tab) => {
      if (tab.disabled) {
        return;
      }
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      if (onChange) {
        onChange(nextValue, tab);
      }
    },
    [isControlled, onChange]
  );

  const handleKeyDown = useCallback(
    (event, currentIndex) => {
      const enabledTabs = tabs.filter((tab) => !tab.disabled);
      if (enabledTabs.length === 0) {
        return;
      }
      const currentTab = tabs[currentIndex];
      const enabledIndex = enabledTabs.findIndex((tab) => tab.value === currentTab.value);
      let nextIndex = enabledIndex;

      if (event.key === 'ArrowRight') {
        nextIndex = (enabledIndex + 1) % enabledTabs.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (enabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = enabledTabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const nextTab = enabledTabs[nextIndex];
      handleSelect(nextTab.value, nextTab);
      const nextNode = tabRefs.current[nextTab.value];
      if (nextNode) {
        nextNode.focus();
      }
    },
    [tabs, handleSelect]
  );

  const config = VARIANTS[variant] || VARIANTS.underline;
  const sizeClass = SIZES[size] || SIZES.md;

  const panelContent = useMemo(() => {
    if (keepMounted) {
      return tabs.map((tab) => (
        <div
          key={tab.value}
          role="tabpanel"
          id={`tabpanel-${tab.value}`}
          aria-labelledby={`tab-${tab.value}`}
          hidden={tab.value !== activeValue}
          className={['focus:outline-none', config.panel, panelClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {tab.content}
        </div>
      ));
    }

    const activeTab = tabs.find((tab) => tab.value === activeValue);
    if (!activeTab) {
      return null;
    }

    return (
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab.value}`}
        aria-labelledby={`tab-${activeTab.value}`}
        tabIndex={0}
        className={['focus:outline-none', config.panel, panelClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {activeTab.content}
      </div>
    );
  }, [tabs, activeValue, keepMounted, config.panel, panelClassName]);

  return (
    <div
      ref={ref}
      className={['w-full', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div
        role="tablist"
        className={[
          'flex',
          fullWidth ? 'w-full' : 'flex-wrap',
          config.list,
          listClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.value === activeValue;
          const Icon = tab.icon;

          return (
            <button
              key={tab.value}
              ref={(node) => {
                tabRefs.current[tab.value] = node;
              }}
              role="tab"
              id={`tab-${tab.value}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.value}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleSelect(tab.value, tab)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={[
                'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1',
                sizeClass,
                config.tab,
                fullWidth ? 'flex-1' : '',
                isActive ? config.active : config.inactive,
                tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                tabClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {Icon ? <Icon size={16} aria-hidden="true" /> : null}
              {tab.label}
              {tab.badge !== undefined && tab.badge !== null ? (
                <span
                  className={[
                    'ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {panelContent}
    </div>
  );
});

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
      content: PropTypes.node,
      icon: PropTypes.elementType,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['underline', 'pill', 'enclosed', 'minimal']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  listClassName: PropTypes.string,
  tabClassName: PropTypes.string,
  panelClassName: PropTypes.string,
  keepMounted: PropTypes.bool,
  testId: PropTypes.string,
};

export default Tabs;
export { VARIANTS as TABS_VARIANTS, SIZES as TABS_SIZES };