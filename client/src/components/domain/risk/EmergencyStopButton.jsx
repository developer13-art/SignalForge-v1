import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';
import ConfirmDialog from '../../common/ConfirmDialog';
import Alert from '../../feedback/Alert';

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2.5',
};

const EmergencyStopButton = forwardRef(function EmergencyStopButton(
  {
    onStop,
    onResume,
    active = false,
    size = 'md',
    disabled = false,
    showIcon = true,
    confirmStop = true,
    confirmResume = true,
    stopLabel = 'Emergency Stop',
    resumeLabel = 'Resume Trading',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const sizeClass = SIZES[size] || SIZES.md;

  const handleClick = () => {
    if (disabled || loading) {
      return;
    }
    if ((active && confirmResume) || (!active && confirmStop)) {
      setDialogOpen(true);
    } else {
      executeAction();
    }
  };

  const executeAction = async () => {
    try {
      setLoading(true);
      if (active) {
        if (onResume) {
          await onResume();
        }
      } else if (onStop) {
        await onStop();
      }
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
          sizeClass,
          active
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500'
            : 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      >
        {showIcon ? (
          loading ? (
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          ) : active ? (
            <ShieldAlert size={14} aria-hidden="true" />
          ) : (
            <AlertTriangle size={14} aria-hidden="true" />
          )
        ) : null}
        {active ? resumeLabel : stopLabel}
      </button>

      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={executeAction}
        variant={active ? 'info' : 'danger'}
        title={active ? 'Resume Automated Trading?' : 'Emergency Stop Trading?'}
        description={
          active
            ? 'Automated trading will resume for all your active broker accounts. Existing positions are not affected.'
            : 'This will immediately disable automated trading across all your accounts. Existing open positions remain open and must be managed manually.'
        }
        confirmLabel={active ? 'Resume Trading' : 'Stop Trading Now'}
        cancelLabel="Cancel"
        confirmLoading={loading}
      >
        {!active ? (
          <Alert variant="warning" size="sm" className="mt-3">
            <p className="text-xs font-semibold">Important</p>
            <p className="mt-1 text-xs">
              The emergency stop does not close your existing positions. It only prevents new
              automated trades from being executed.
            </p>
          </Alert>
        ) : null}
      </ConfirmDialog>
    </>
  );
});

EmergencyStopButton.propTypes = {
  onStop: PropTypes.func,
  onResume: PropTypes.func,
  active: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  showIcon: PropTypes.bool,
  confirmStop: PropTypes.bool,
  confirmResume: PropTypes.bool,
  stopLabel: PropTypes.string,
  resumeLabel: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default EmergencyStopButton;