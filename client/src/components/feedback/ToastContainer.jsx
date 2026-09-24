import React, { forwardRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Toast from './Toast';

const POSITIONS = {
  'top-left': 'top-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end',
};

const STACK_ORDER = {
  'top-left': 'flex-col',
  'top-center': 'flex-col',
  'top-right': 'flex-col',
  'bottom-left': 'flex-col-reverse',
  'bottom-center': 'flex-col-reverse',
  'bottom-right': 'flex-col-reverse',
};

const ToastContainer = forwardRef(function ToastContainer(
  {
    toasts = [],
    position = 'top-right',
    maxToasts = 5,
    gap = 'md',
    width = 380,
    onDismiss,
    onClose,
    containerClassName = '',
    toastClassName = '',
    testId,
    ...rest
  },
  ref
) {
  const gapClass = gap === 'sm' ? 'gap-2' : gap === 'lg' ? 'gap-4' : 'gap-3';
  const positionClass = POSITIONS[position] || POSITIONS['top-right'];
  const stackClass = STACK_ORDER[position] || STACK_ORDER['top-right'];

  const visibleToasts = useMemo(() => {
    if (!maxToasts || maxToasts <= 0) {
      return toasts;
    }
    return toasts.slice(0, maxToasts);
  }, [toasts, maxToasts]);

  const handleDismiss = useCallback(
    (id) => {
      if (onDismiss) {
        onDismiss(id);
      } else if (onClose) {
        onClose(id);
      }
    },
    [onDismiss, onClose]
  );

  if (typeof document === 'undefined' || visibleToasts.length === 0) {
    return null;
  }

  const content = (
    <div
      ref={ref}
      aria-live="polite"
      aria-atomic="false"
      className={[
        'pointer-events-none fixed z-[9999] flex',
        positionClass,
        stackClass,
        gapClass,
        containerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{ width: typeof width === 'number' ? `${width}px` : width }}
        >
          <Toast
            {...toast}
            onClose={handleDismiss}
            className={[toast.className, toastClassName].filter(Boolean).join(' ')}
          />
        </div>
      ))}
    </div>
  );

  return createPortal(content, document.body);
});

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  position: PropTypes.oneOf([
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ]),
  maxToasts: PropTypes.number,
  gap: PropTypes.oneOf(['sm', 'md', 'lg']),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onDismiss: PropTypes.func,
  onClose: PropTypes.func,
  containerClassName: PropTypes.string,
  toastClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default ToastContainer;
export { POSITIONS as TOAST_CONTAINER_POSITIONS };