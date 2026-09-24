import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const SIDES = {
  right: {
    container: 'inset-y-0 right-0',
    panel: 'h-full w-full max-w-md',
    enter: 'translate-x-0',
    leave: 'translate-x-full',
  },
  left: {
    container: 'inset-y-0 left-0',
    panel: 'h-full w-full max-w-md',
    enter: 'translate-x-0',
    leave: '-translate-x-full',
  },
  bottom: {
    container: 'inset-x-0 bottom-0',
    panel: 'w-full max-h-[85vh] rounded-t-2xl',
    enter: 'translate-y-0',
    leave: 'translate-y-full',
  },
  top: {
    container: 'inset-x-0 top-0',
    panel: 'w-full max-h-[85vh] rounded-b-2xl',
    enter: 'translate-y-0',
    leave: '-translate-y-full',
  },
};

function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') {
      return undefined;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [active]);
}

const Sheet = forwardRef(function Sheet(
  {
    open,
    onClose,
    side = 'bottom',
    title,
    description,
    children,
    footer,
    showHandle = true,
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    className = '',
    overlayClassName = '',
    panelClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const panelRef = useRef(null);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 220);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  useLockBodyScroll(open);

  const handleBackdropClick = useCallback(
    (event) => {
      if (!closeOnBackdrop) {
        return;
      }
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose],
  );

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  if (!visible || typeof document === 'undefined') {
    return null;
  }

  const sideConfig = SIDES[side] || SIDES.bottom;

  const content = (
    <div
      className={['fixed inset-0 z-[9999]', overlayClassName].filter(Boolean).join(' ')}
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        className={[
          'absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />

      <div
        ref={(node) => {
          panelRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="dialog"
        aria-modal="true"
        className={[
          'absolute flex flex-col bg-white shadow-2xl transition-transform duration-200 ease-out',
          sideConfig.container,
          sideConfig.panel,
          open ? sideConfig.enter : sideConfig.leave,
          panelClassName,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        {showHandle && side === 'bottom' ? (
          <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
            <span className="h-1.5 w-12 rounded-full bg-slate-300" />
          </div>
        ) : null}

        {title || description || showCloseButton ? (
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <div className="flex-1 space-y-1">
              {title ? (
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              ) : null}
              {description ? (
                <p className="text-sm text-slate-500">{description}</p>
              ) : null}
            </div>

            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sheet"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(content, document.body);
});

Sheet.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  showHandle: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
  panelClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Sheet;
export { SIDES as SHEET_SIDES };