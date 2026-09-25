import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Steps from '../../navigation/Steps';

const DEFAULT_STEPS = [
  { key: 'intro', label: 'Introduction', description: 'Verify your identity' },
  { key: 'personal', label: 'Personal Info', description: 'Basic details' },
  { key: 'document', label: 'Document', description: 'Upload identity' },
  { key: 'selfie', label: 'Selfie', description: 'Liveness check' },
  { key: 'review', label: 'Review', description: 'Confirmation' },
  { key: 'result', label: 'Result', description: 'Verification outcome' },
];

const KycProgressStepper = forwardRef(function KycProgressStepper(
  {
    currentStep = 0,
    steps = DEFAULT_STEPS,
    orientation = 'horizontal',
    size = 'md',
    error = false,
    clickable = false,
    onStepClick,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  return (
    <Steps
      ref={ref}
      steps={steps}
      currentStep={currentStep}
      orientation={orientation}
      size={size}
      error={error}
      clickable={clickable}
      onStepClick={onStepClick}
      showDescription
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

KycProgressStepper.propTypes = {
  currentStep: PropTypes.number,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node.isRequired,
      description: PropTypes.node,
      icon: PropTypes.elementType,
      disabled: PropTypes.bool,
      status: PropTypes.oneOf(['complete', 'active', 'pending', 'error', 'disabled']),
    })
  ),
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  error: PropTypes.bool,
  clickable: PropTypes.bool,
  onStepClick: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default KycProgressStepper;
export { DEFAULT_STEPS as KYC_DEFAULT_STEPS };