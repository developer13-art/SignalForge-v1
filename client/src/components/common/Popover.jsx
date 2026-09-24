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

const GAP = 8;
const VIEWPORT_PADDING = 8;

function computePosition(triggerRect, panelRect, placement) {
  const [side, align = 'center'] = placement.split('-');
  let top = 0;
  let left = 0;

  switch (side) {
    case 'top':
      top = triggerRect.top - panelRect.height - GAP;
      break;
    case 'bottom':
      top = triggerRect.bottom + GAP;
      break;
    case 'left':
      left = triggerRect.left - panelRect.width - GAP;
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
      left = triggerRect.right - panelRect.width;
    } else {
      left = triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;
    }
  } else if (align === 'start') {
    top = triggerRect.top;
  } else if (align === 'end') {
    top = triggerRect.bottom - panelRect.height;
  } else {
    top = triggerRect.top + triggerRect.height / 2 - panelRect.height / 2;
  }

  return { top, left };
}

function clampPosition(position, panelRect) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let { top, left } = position;

  if (left < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  }
  if (left + panelRect.width > viewportWidth - VIEWPORT_PADDING) {
    left = viewportWidth - panelRect.width - VIEWPORT_PADDING;
  }
  if (top < VIEWPORT_PADDING) {
    top = VIEWPORT_PADDING;
  }
  if (top + panelRect.height > viewportHeight - VIEWPORT_PADDING) {
    top = viewportHeight - panelRect.height - VIEWPORT_PADDING;
  }

  return { top, left };
}

const Popover = forwardRef(function Popover(
  {
    children,
    content,
    placement = 'bottom',
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    arrow = true,
    offset = 0,
    className = '',
    panelClassName = '',
    width,
    minWidth,
    maxWidth = 400,
    testId,
    ...rest
  },
  ref,
) {
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

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

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !panelRef.current) {
      return;
    }
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const raw = computePosition(triggerRect, panelRect, placement);
    const clamped = clampPosition(
      { top: raw.top + offset, left: raw.left + offset },
      panelRect,
    );
    setPosition(clamped);
  }, [placement, offset]);

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }
    updatePosition();
    return undefined;
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

    const handleClick = (event) => {
      if (!closeOnOutsideClick) {
        return;
      }
      const target = event.target;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (!closeOnEscape) {
        return;
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeOnOutsideClick, closeOnEscape, setOpen]);

  const panelStyle = useMemo(
    () => ({
      top: `${position.top}px`,
      left: `${position.left}px`,
      width: width ? `${width}px` : undefined,
      minWidth: minWidth ? `${minWidth}px` : undefined,
      maxWidth: `${maxWidth}px`,
    }),
    [position, width, minWidth, maxWidth],
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
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
  });

  const panelContent =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            className={[
              'fixed z-[9998] rounded-lg border border-slate-200 bg-white shadow-xl',
              panelClassName,
            ]
              .filter(Boolean)
              .join(' ')}
            style={panelStyle}
            data-testid={testId ? `${testId}-panel` : undefined}
          >
            {arrow ? (
              <span
                className={[
                  'absolute h-2 w-2 rotate-45 border border-slate-200 bg-white',
                  placement.startsWith('top')
                    ? 'bottom-[-5px] border-t-0 border-l-0'
                    : placement.startsWith('bottom')
                    ? 'top-[-5px] border-b-0 border-r-0'
                    : placement.startsWith('left')
                    ? 'right-[-5px] border-t-0 border-b-0 border-l-0'
                    : 'left-[-5px] border-t-0 border-b-0 border-r-0',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  placement === 'top-start' || placement === 'bottom-start'
                    ? { left: '16px' }
                    : placement === 'top-end' || placement === 'bottom-end'
                    ? { right: '16px' }
                    : placement === 'left-start' || placement === 'right-start'
                    ? { top: '16px' }
                    : placement === 'left-end' || placement === 'right-end'
                    ? { bottom: '16px' }
                    : undefined
                }
                aria-hidden="true"
              />
            ) : null}
            {content}
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
      {panelContent}
    </>
  );
});

Popover.propTypes = {
  children: PropTypes.element.isRequired,
  content: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(Object.keys(PLACEMENTS)),
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  defaultOpen: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  arrow: PropTypes.bool,
  offset: PropTypes.number,
  className: PropTypes.string,
  panelClassName: PropTypes.string,
  width: PropTypes.number,
  minWidth: PropTypes.number,
  maxWidth: PropTypes.number,
  testId: PropTypes.string,
};

export default Popover;
export { PLACEMENTS as POPOVER_PLACEMENTS };