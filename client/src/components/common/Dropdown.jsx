import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Check, ChevronRight } from 'lucide-react';

const ALIGNMENTS = {
  start: 'start',
  end: 'end',
  center: 'center',
};

const GAP = 6;
const VIEWPORT_PADDING = 8;

function computePosition(triggerRect, menuRect, side, align) {
  let top = 0;
  let left = 0;

  if (side === 'bottom') {
    top = triggerRect.bottom + GAP;
  } else {
    top = triggerRect.top - menuRect.height - GAP;
  }

  if (align === 'start') {
    left = triggerRect.left;
  } else if (align === 'end') {
    left = triggerRect.right - menuRect.width;
  } else {
    left = triggerRect.left + triggerRect.width / 2 - menuRect.width / 2;
  }

  return { top, left };
}

function clampPosition(position, menuRect) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let { top, left } = position;

  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }
  if (left + menuRect.width > viewportWidth - VIEWPORT_PADDING) {
    left = viewportWidth - menuRect.width - VIEWPORT_PADDING;
  }
  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING;
  }
  if (top + menuRect.height > viewportHeight - VIEWPORT_PADDING) {
    top = viewportHeight - menuRect.height - VIEWPORT_PADDING;
  }

  return { top, left };
}

const Dropdown = forwardRef(function Dropdown(
  {
    children,
    items = [],
    side = 'bottom',
    align = 'start',
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false,
    closeOnSelect = true,
    closeOnOutsideClick = true,
    className = '',
    menuClassName = '',
    minWidth = 200,
    maxWidth = 320,
    testId,
    ...rest
  },
  ref,
) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : internalOpen;

  const [position, setPosition] = useState({ top: 0, left: 0 });

  const setOpen = useCallback(
    (value) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      if (onOpenChange) {
        onOpenChange(value);
      }
    },
    [isControlled, onOpenChange],
  );

  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) {
      return;
    }
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const raw = computePosition(triggerRect, menuRect, side, align);
    const clamped = clampPosition(raw, menuRect);
    setPosition(clamped);
  }, [side, align]);

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleScrollOrResize = () => updatePosition();

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!closeOnOutsideClick) {
        return;
      }
      const target = event.target;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeOnOutsideClick, setOpen]);

  const handleItemClick = useCallback(
    (item, event) => {
      if (item.disabled) {
        return;
      }
      if (item.onClick) {
        item.onClick(event);
      }
      if (closeOnSelect) {
        setOpen(false);
      }
    },
    [closeOnSelect, setOpen],
  );

  const menuStyle = useMemo(
    () => ({
      top: `${position.top}px`,
      left: `${position.left}px`,
      minWidth: `${minWidth}px`,
      maxWidth: `${maxWidth}px`,
    }),
    [position, minWidth, maxWidth],
  );

  const child = React.Children.only(children);
  const triggerElement = React.cloneElement(child, {
    onClick: (event) => {
      if (child.props.onClick) {
        child.props.onClick(event);
      }
      if (!event.defaultPrevented) {
        toggle();
      }
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  });

  const renderedItems = useMemo(
    () =>
      items.filter(Boolean).map((item, index) => {
        if (item.type === 'divider') {
          return (
            <li
              key={item.key || `divider-${index}`}
              role="separator"
              className="my-1 h-px bg-slate-200"
            />
          );
        }

        if (item.type === 'header') {
          return (
            <li
              key={item.key || `header-${index}`}
              className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400"
            >
              {item.label}
            </li>
          );
        }

        const itemClassName = [
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-100',
          item.disabled
            ? 'cursor-not-allowed text-slate-400'
            : item.danger
            ? 'text-rose-600 hover:bg-rose-50'
            : 'text-slate-700 hover:bg-slate-100',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={item.key || item.id || item.label || index} role="none">
            <button
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={(event) => handleItemClick(item, event)}
              className={itemClassName}
            >
              {item.icon ? (
                <span className="flex h-4 w-4 items-center justify-center text-slate-500">
                  <item.icon size={16} aria-hidden="true" />
                </span>
              ) : null}

              <span className="flex-1 truncate text-left">{item.label}</span>

              {item.shortcut ? (
                <span className="ml-auto text-xs text-slate-400">{item.shortcut}</span>
              ) : null}

              {item.checked ? (
                <Check size={14} className="ml-auto text-indigo-600" aria-hidden="true" />
              ) : null}

              {item.hasSubmenu ? (
                <ChevronRight size={14} className="ml-auto text-slate-400" aria-hidden="true" />
              ) : null}
            </button>
          </li>
        );
      }),
    [items, handleItemClick],
  );

  const menuContent =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            className={[
              'fixed z-[9998] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl',
              menuClassName,
            ]
              .filter(Boolean)
              .join(' ')}
            style={menuStyle}
            data-testid={testId ? `${testId}-menu` : undefined}
          >
            <ul role="none" className="max-h-80 overflow-y-auto px-1">
              {renderedItems}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={['inline-flex', className].filter(Boolean).join(' ')}
        {...rest}
      >
        {triggerElement}
      </span>
      {menuContent}
    </>
  );
});

Dropdown.propTypes = {
  children: PropTypes.element.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        type: PropTypes.oneOf(['divider', 'header']),
        key: PropTypes.string,
        label: PropTypes.string,
      }),
      PropTypes.shape({
        key: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string.isRequired,
        icon: PropTypes.elementType,
        shortcut: PropTypes.string,
        disabled: PropTypes.bool,
        danger: PropTypes.bool,
        checked: PropTypes.bool,
        hasSubmenu: PropTypes.bool,
        onClick: PropTypes.func,
      }),
    ]),
  ),
  side: PropTypes.oneOf(['top', 'bottom']),
  align: PropTypes.oneOf(Object.keys(ALIGNMENTS)),
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  defaultOpen: PropTypes.bool,
  closeOnSelect: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  className: PropTypes.string,
  menuClassName: PropTypes.string,
  minWidth: PropTypes.number,
  maxWidth: PropTypes.number,
  testId: PropTypes.string,
};

export default Dropdown;
export { ALIGNMENTS as DROPDOWN_ALIGNMENTS };