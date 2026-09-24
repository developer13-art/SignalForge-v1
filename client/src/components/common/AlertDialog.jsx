import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

const VARIANTS = {
  info: {
    icon: Info,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    confirmBg: 'bg-sky-600 hover:bg-sky-700 focus-visible:ring-sky-500',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    confirmBg: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmBg: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500',
  },
  danger: {
    icon: XCircle,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    confirmBg: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500',
  },
};

const AlertDialog = forwardRef(function AlertDialog(
  {
    open,
    onClose,
    onConfirm,
    variant = 'warning',
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmLoading = false,
    confirmDisabled = false,
    closeOnBackdrop = false,
    closeOnEscape = true,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const panelRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = confirmLoading || internalLoading;

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, isLoading, onClose]);

  const handleBackdropClick = useCallback(
    (event) => {
      if (!closeOnBackdrop || isLoading) {
        return;
      }
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, isLoading, onClose],
  );

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) {
      onClose();
      return;
    }

    try {
      const result = onConfirm();
      if (result && typeof result.then === 'function') {
        setInternalLoading(true);
        await result;
        setInternalLoading(false);
      }
    } catch (error) {
      setInternalLoading(false);
      throw error;
    }
  }, [onConfirm, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const config = VARIANTS[variant] || VARIANTS.warning;
  const IconComponent = config.icon;

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
        role="alertdialog"
        aria-modal="true"
        className={[
          'relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div
              className={[
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                config.iconBg,
                config.iconColor,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <IconComponent size={24} aria-hidden="true" />
            </div>

            <div className="flex-1 space-y-2 pt-1">
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
              {description ? (
                <p className="text-sm leading-relaxed text-slate-600">{description}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled || isLoading}
            className={[
              'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              config.confirmBg,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isLoading ? (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
});

AlertDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  title: PropTypes.node,
  description: PropTypes.node,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmLoading: PropTypes.bool,
  confirmDisabled: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default AlertDialog;
export { VARIANTS as ALERT_DIALOG_VARIANTS };