import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const SIDES = {
  left: {
    container: 'inset-y-0 left-0',
    translate: {
      open: 'translate-x-0',
      closed: '-translate-x-full',
    },
  },
  right: {
    container: 'inset-y-0 right-0',
    translate: {
      open: 'translate-x-0',
      closed: 'translate-x-full',
    },
  },
  top: {
    container: 'inset-x-0 top-0',
    translate: {
      open: 'translate-y-0',
      closed: '-translate-y-full',
    },
  },
  bottom: {
    container: 'inset-x-0 bottom-0',
    translate: {
      open: 'translate-y-0',
      closed: 'translate-y-full',
    },
  },
};

const SIZE_CLASSES = {
  left: {
    sm: 'w-72',
    md: 'w-96',
    lg: 'w-[32rem]',
    xl: 'w-[42rem]',
    full: 'w-screen',
  },
  right: {
    sm: 'w-72',
    md: 'w-96',
    lg: 'w-[32rem]',
    xl: 'w-[42rem]',
    full: 'w-screen',
  },
  top: {
    sm: 'h-40',
    md: 'h-64',
    lg: 'h-96',
    xl: 'h-[32rem]',
    full: 'h-screen',
  },
  bottom: {
    sm: 'h-40',
    md: 'h-64',
    lg: 'h-96',
    xl: 'h-[32rem]',
    full: 'h-screen',
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

const Drawer = forwardRef(function Drawer(
  {
    open,
    onClose,
    side = 'right',
    size = 'md',
    title,
    description,
    children,
    footer,
    closeOnBackdrop = true,
    closeOnEscape = true,
    showCloseButton = true,
    className = '',
    overlayClassName = '',
    headerClassName = '',
    bodyClassName = '',
    footerClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 220);
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

  useEffect(() => {
    if (open && panelRef.current) {
      const focusables = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }
  }, [open]);

  const sideConfig = SIDES[side] || SIDES.right;
  const sizeClass = (SIZE_CLASSES[side] || SIZE_CLASSES.right)[size] || SIZE_CLASSES.right.md;
  const translateClass = open ? sideConfig.translate.open : sideConfig.translate.closed;

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const content = (
    <div
      className={[
        'fixed inset-0 z-[9999]',
        open ? 'pointer-events-auto' : 'pointer-events-none',
        overlayClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        className={[
          'absolute inset-0 bg-slate-900/60 transition-opacity duration-200',
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
          sizeClass,
          translateClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        {title || description || showCloseButton ? (
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
                aria-label="Close drawer"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}

        <div
          className={['flex-1 overflow-y-auto px-6 py-4', bodyClassName]
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

  return createPortal(content, document.body);
});

Drawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  side: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default Drawer;
export { SIDES as DRAWER_SIDES, SIZE_CLASSES as DRAWER_SIZES };