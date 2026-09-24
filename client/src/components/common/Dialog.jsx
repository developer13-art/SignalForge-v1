import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

const VARIANTS = {
  info: 'border-sky-200',
  success: 'border-emerald-200',
  warning: 'border-amber-200',
  danger: 'border-rose-200',
  neutral: 'border-slate-200',
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

const Dialog = forwardRef(function Dialog(
  {
    open,
    onClose,
    variant = 'neutral',
    size = 'md',
    icon: Icon,
    title,
    description,
    children,
    footer,
    closeOnBackdrop = true,
    closeOnEscape = true,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const panelRef = useRef(null);

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

  useEffect(() => {
    if (open && panelRef.current) {
      const focusables = panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }
  }, [open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" />

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
          'relative z-10 w-full overflow-hidden rounded-xl border bg-white shadow-2xl',
          SIZES[size] || SIZES.md,
          VARIANTS[variant] || VARIANTS.neutral,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            {Icon ? (
              <div
                className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  variant === 'danger'
                    ? 'bg-rose-100 text-rose-600'
                    : variant === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : variant === 'success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : variant === 'info'
                    ? 'bg-sky-100 text-sky-600'
                    : 'bg-slate-100 text-slate-600',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Icon size={20} aria-hidden="true" />
              </div>
            ) : null}

            <div className="flex-1 space-y-2">
              {title ? (
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
              ) : null}
              {description ? (
                <p className="text-sm text-slate-600">{description}</p>
              ) : null}
              {children ? <div className="pt-1">{children}</div> : null}
            </div>
          </div>
        </div>

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

Dialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'neutral']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  icon: PropTypes.elementType,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default Dialog;
export { SIZES as DIALOG_SIZES, VARIANTS as DIALOG_VARIANTS };