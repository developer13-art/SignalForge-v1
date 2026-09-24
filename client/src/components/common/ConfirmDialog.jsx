import React, { forwardRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import AlertDialog from './AlertDialog';

const ConfirmDialog = forwardRef(function ConfirmDialog(
  {
    open,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'warning',
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
  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }, [onConfirm, onClose]);

  return (
    <AlertDialog
      ref={ref}
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={variant}
      confirmLoading={confirmLoading || loading}
      confirmDisabled={confirmDisabled}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.node,
  description: PropTypes.node,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  confirmLoading: PropTypes.bool,
  confirmDisabled: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ConfirmDialog;