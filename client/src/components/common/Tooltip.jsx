import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const PLACEMENTS = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'top-start': 'top-start',
  'top-end': 'top-end',
  'bottom-start': 'bottom-start',
  'bottom-end': 'bottom-end',
  'left-start': 'left-start',
  'left-end': 'left-end',
  'right-start': 'right-start',
  'right-end': 'right-end',
};

const VARIANT_CLASSES = {
  dark: 'bg-slate-900 text-white',
  light: 'bg-white text-slate-900 border border-slate-200',
  primary: 'bg-indigo-600 text-white',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-white',
  danger: 'bg-rose-600 text-white',
};

const ARROW_VARIANT_CLASSES = {
  dark: 'border-t-slate-900 border-b-slate-900 border-l-slate-900 border-r-slate-900',
  light: 'border-t-white border-b-white border-l-white border-r-white',
  primary: 'border-t-indigo-600 border-b-indigo-600 border-l-indigo-600 border-r-indigo-600',
  success: 'border-t-emerald-600 border-b-emerald-600 border-l-emerald-600 border-r-emerald-600',
  warning: 'border-t-amber-500 border-b-amber-500 border-l-amber-500 border-r-amber-500',
  danger: 'border-t-rose-600 border-b-rose-600 border-l-rose-600 border-r-rose-600',
};

const DEFAULT_DELAY_OPEN = 200;
const DEFAULT_DELAY_CLOSE = 100;
const VIEWPORT_PADDING = 8;
const GAP = 8;

function computePosition(triggerRect, tooltipRect, placement) {
  let top = 0;
  let left = 0;

  const [side, align = 'center'] = placement.split('-');

  switch (side) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - GAP;
      break;
    case 'bottom':
      top = triggerRect.bottom + GAP;
      break;
    case 'left':
      left = triggerRect.left - tooltipRect.width - GAP;
      break;
    case 'right':
      left = triggerRect.right + GAP;
      break;
    default:
      top = triggerRect.bottom + GAP;
  }

  if (side === 'top' || side === 'bottom') {
    if (align === 'start') {
      left = triggerRect.left;
    } else if (align === 'end') {
      left = triggerRect.right - tooltipRect.width;
    } else {
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    }
  } else {
    if (align === 'start') {
      top = triggerRect.top;
    } else if (align === 'end') {
      top = triggerRect.bottom - tooltipRect.height;
    } else {
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
    }
  }

  return { top, left };
}

function clampToViewport(position, tooltipRect) {
  let { top, left } = position;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }
  if (left + tooltipRect.width > viewportWidth - VIEWPORT_PADDING) {
    left = viewportWidth - tooltipRect.width - VIEWPORT_PADDING;
  }
  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING;
  }
  if (top + tooltipRect.height > viewportHeight - VIEWPORT_PADDING) {
    top = viewportHeight - tooltipRect.height - VIEWPORT_PADDING;
  }

  return { top, left };
}

function getArrowClasses(placement, variant) {
  const [side] = placement.split('-');
  const arrowColor = ARROW_VARIANT_CLASSES[variant] || ARROW_VARIANT_CLASSES.dark;

  const base = 'absolute h-0 w-0 border-4 border-transparent';

  switch (side) {
    case 'top':
      return `${base} left-1/2 -translate-x-1/2 top-full border-t-current ${arrowColor}`;
    case 'bottom':
      return `${base} left-1/2 -translate-x-1/2 bottom-full border-b-current ${arrowColor}`;
    case 'left':
      return `${base} top-1/2 -translate-y-1/2 left-full border-l-current ${arrowColor}`;
    case 'right':
      return `${base} top-1/2 -translate-y-1/2 right-full border-r-current ${arrowColor}`;
    default:
      return base;
  }
}

const Tooltip = forwardRef(function Tooltip(
  {
    children,
    content,
    placement = 'top',
    variant = 'dark',
    delayOpen = DEFAULT_DELAY_OPEN,
    delayClose = DEFAULT_DELAY_CLOSE,
    disabled = false,
    open: controlledOpen,
    onOpenChange,
    offset: _offset,
    className = '',
    contentClassName = '',
    arrow = true,
    maxWidth = 320,
    testId,
    ...rest
  },
  ref,
) {
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value) => {
      if (isControlled) {
        if (onOpenChange) {
          onOpenChange(value);
        }
      } else {
        setInternalOpen(value);
        if (onOpenChange) {
          onOpenChange(value);
        }
      }
    },
    [isControlled, onOpenChange],
  );

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    if (disabled) {
      return;
    }
    clearTimers();
    openTimerRef.current = setTimeout(() => {
      setOpen(true);
    }, delayOpen);
  }, [disabled, delayOpen, setOpen, clearTimers]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, delayClose);
  }, [delayClose, setOpen, clearTimers]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) {
      return;
    }
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const raw = computePosition(triggerRect, tooltipRect, placement);
    const clamped = clampToViewport(raw, tooltipRect);
    setPosition(clamped);
  }, [placement]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    updatePosition();

    const handleScroll = () => {
      updatePosition();
    };

    const handleResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  useEffect(
    () => () => {
      clearTimers();
    },
    [clearTimers],
  );

  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.dark;

  const tooltipContent = useMemo(() => {
    if (open !== true) {
      return null;
    }

    if (typeof document === 'undefined') {
      return null;
    }

    return createPortal(
      <div
        ref={tooltipRef}
        role="tooltip"
        className={[
          'pointer-events-none fixed z-[9999] rounded-md px-3 py-1.5 text-xs font-medium shadow-lg',
          variantClasses,
          contentClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          maxWidth: `${maxWidth}px`,
        }}
        data-testid={testId ? `${testId}-content` : undefined}
      >
        {content}
        {arrow ? <span className={getArrowClasses(placement, variant)} /> : null}
      </div>,
      document.body,
    );
  }, [
    open,
    position,
    variantClasses,
    contentClassName,
    content,
    arrow,
    placement,
    variant,
    maxWidth,
    testId,
  ]);

  const triggerProps = {
    onMouseEnter: scheduleOpen,
    onMouseLeave: scheduleClose,
    onFocus: () => {
      clearTimers();
      setOpen(true);
    },
    onBlur: () => {
      clearTimers();
      setOpen(false);
    },
    onTouchStart: () => {
      clearTimers();
      setOpen(!open);
    },
  };

  const child = React.Children.only(children);
  const triggerElement = React.cloneElement(child, triggerProps);

  return (
    <>
      <span
        ref={triggerRef}
        className={['inline-flex', className].filter(Boolean).join(' ')}
        {...rest}
      >
        <span
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className="contents"
        >
          {triggerElement}
        </span>
      </span>
      {tooltipContent}
    </>
  );
});

Tooltip.propTypes = {
  children: PropTypes.element.isRequired,
  content: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(Object.keys(PLACEMENTS)),
  variant: PropTypes.oneOf(['dark', 'light', 'primary', 'success', 'warning', 'danger']),
  delayOpen: PropTypes.number,
  delayClose: PropTypes.number,
  disabled: PropTypes.bool,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  offset: PropTypes.number,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  arrow: PropTypes.bool,
  maxWidth: PropTypes.number,
  testId: PropTypes.string,
};

export default Tooltip;
export { PLACEMENTS as TOOLTIP_PLACEMENTS };