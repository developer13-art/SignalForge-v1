import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ConfirmDialog from '../common/ConfirmDialog';

const Confirm = forwardRef(function Confirm(
  {
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'warning',
    onConfirm,
    onCancel,
    closeOnBackdrop = false,
    closeOnEscape = true,
    testId,
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(false);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setContext(null);
  }, []);

  const requestConfirmation = useCallback((nextContext = null) => {
    setContext(nextContext);
    setOpen(true);
    return new Promise((resolve) => {
      setContext((prev) => ({ ...prev, resolve }));
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      if (onConfirm) {
        await onConfirm(context);
      }
      if (context && typeof context.resolve === 'function') {
        context.resolve(true);
      }
      closeDialog();
    } catch (error) {
      if (context && typeof context.resolve === 'function') {
        context.resolve(false);
      }
    } finally {
      setLoading(false);
    }
  }, [onConfirm, context, closeDialog]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel(context);
    }
    if (context && typeof context.resolve === 'function') {
      context.resolve(false);
    }
    closeDialog();
  }, [onCancel, context, closeDialog]);

  useImperativeHandle(
    ref,
    () => ({
      confirm: requestConfirmation,
      close: closeDialog,
      isOpen: () => open,
    }),
    [requestConfirmation, closeDialog, open]
  );

  return (
    <ConfirmDialog
      open={open}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={context && context.title ? context.title : title}
      description={context && context.description ? context.description : description}
      confirmLabel={context && context.confirmLabel ? context.confirmLabel : confirmLabel}
      cancelLabel={context && context.cancelLabel ? context.cancelLabel : cancelLabel}
      variant={context && context.variant ? context.variant : variant}
      confirmLoading={loading}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
      testId={testId}
    />
  );
});

Confirm.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  testId: PropTypes.string,
};

export default Confirm;