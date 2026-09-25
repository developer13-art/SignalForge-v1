import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import AlertDialog from '../../common/AlertDialog';
import Alert from '../../feedback/Alert';

const BrokerLogoutDialog = forwardRef(function BrokerLogoutDialog(
  {
    open,
    onClose,
    onConfirm,
    account,
    loading = false,
    closeOnBackdrop = false,
    closeOnEscape = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const accountLabel = account
    ? account.nickname || account.broker || account.server || 'this account'
    : 'this account';

  const hasOpenPositions = account && account.hasOpenPositions;

  return (
    <AlertDialog
      ref={ref}
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="danger"
      title="Disconnect Broker Account"
      description={
        <span>
          You are about to disconnect <strong>{accountLabel}</strong>. Automated trading will stop
          immediately for this account. Your existing positions will remain open on the broker
          side.
        </span>
      }
      confirmLabel="Disconnect"
      cancelLabel="Cancel"
      confirmLoading={loading}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
      className={className}
      testId={testId}
      {...rest}
    >
      {hasOpenPositions ? (
        <Alert variant="warning" size="sm" className="mt-3">
          <p className="text-xs font-semibold">Warning: Open positions detected</p>
          <p className="mt-1 text-xs">
            This account currently has open positions. Disconnecting will not close them, but you
            will no longer be able to manage them from SignalForge until you reconnect.
          </p>
        </Alert>
      ) : null}
    </AlertDialog>
  );
});

BrokerLogoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  account: PropTypes.shape({
    nickname: PropTypes.string,
    broker: PropTypes.string,
    server: PropTypes.string,
    hasOpenPositions: PropTypes.bool,
  }),
  loading: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default BrokerLogoutDialog;