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
import { X } from 'lucide-react';

const SIZES = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-[95vw]',
};

const ALIGNMENTS = {
  center: 'items-center',
  top: 'items-start pt-12',
  bottom: 'items-end pb-12',
};

function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [active]);
}

function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active || !containerRef.current) {
      return undefined;
    }

    const container = containerRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const previousActiveElement = document.activeElement;

    const focusables = container.querySelectorAll(focusableSelector);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      container.focus();
    }

    const handleTab = (event) => {
      if (event.key !== 'Tab') {
        return;
      }

      const currentFocusables = Array.from(
        container.querySelectorAll(focusableSelector),
      ).filter((element) => element.offsetParent !== null);

      if (currentFocusables.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = currentFocusables[0];
      const lastElement = currentFocusables[currentFocusables.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleTab);

    return () => {
      container.removeEventListener('keydown', handleTab);
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };
  }, [containerRef, active]);
}

const Modal = forwardRef(function Modal(
  {
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    alignment = 'center',
    closeOnBackdrop = true,
    closeOnEscape = true,
    showCloseButton = true,
    preventScrollLock = false,
    className = '',
    overlayClassName = '',
    bodyClassName = '',
    headerClassName = '',
    footerClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  useLockBodyScroll(open && !preventScrollLock);
  useFocusTrap(containerRef, open);

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
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  const sizeClass = SIZES[size] || SIZES.md;
  const alignmentClass = ALIGNMENTS[alignment] || ALIGNMENTS.center;

  const headerContent = useMemo(() => {
    if (!title && !description && !showCloseButton) {
      return null;
    }

    return (
      <div
        className={[
          'flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4',
          headerClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
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
            aria-label="Close modal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  }, [title, description, showCloseButton, onClose, headerClassName]);

  if (!isVisible || typeof document === 'undefined') {
    return null;
  }

  const modal = (
    <div
      className={[
        'fixed inset-0 z-[9999] flex justify-center overflow-y-auto',
        alignmentClass,
        open ? 'opacity-100' : 'opacity-0',
        'transition-opacity duration-150',
        overlayClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={[
          'relative z-10 my-8 w-full overflow-hidden rounded-xl bg-white shadow-2xl',
          'transition-all duration-150',
          open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0',
          sizeClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        {headerContent}

        <div
          className={['max-h-[70vh] overflow-y-auto px-6 py-4', bodyClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>

        {footer ? (
          <div
            className={[
              'flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4',
              footerClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
});

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
  alignment: PropTypes.oneOf(['center', 'top', 'bottom']),
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  preventScrollLock: PropTypes.bool,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Modal;
export { SIZES as MODAL_SIZES };