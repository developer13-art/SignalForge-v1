import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

const ORIENTATIONS = {
  horizontal: {
    container: 'flex items-center',
    step: 'flex items-center',
    body: 'flex flex-col',
    connector: 'h-0.5 flex-1 min-w-[24px]',
    label: 'mt-2',
  },
  vertical: {
    container: 'flex flex-col',
    step: 'flex items-start',
    body: 'flex flex-col flex-1',
    connector: 'w-0.5 flex-1 min-h-[24px]',
    label: 'mt-0',
  },
};

const SIZES = {
  sm: {
    circle: 'h-6 w-6',
    icon: 12,
    number: 'text-[10px]',
    label: 'text-xs font-medium',
    description: 'text-[10px]',
  },
  md: {
    circle: 'h-8 w-8',
    icon: 14,
    number: 'text-xs',
    label: 'text-sm font-medium',
    description: 'text-xs',
  },
  lg: {
    circle: 'h-10 w-10',
    icon: 16,
    number: 'text-sm',
    label: 'text-base font-semibold',
    description: 'text-sm',
  },
};

const STATUS_STYLES = {
  complete: {
    circle: 'bg-indigo-600 text-white',
    label: 'text-slate-900',
    description: 'text-slate-500',
    connector: 'bg-indigo-600',
  },
  active: {
    circle: 'bg-indigo-600 text-white ring-4 ring-indigo-100',
    label: 'text-slate-900 font-semibold',
    description: 'text-slate-600',
    connector: 'bg-slate-200',
  },
  pending: {
    circle: 'bg-white text-slate-500 border-2 border-slate-300',
    label: 'text-slate-500',
    description: 'text-slate-400',
    connector: 'bg-slate-200',
  },
  error: {
    circle: 'bg-rose-600 text-white',
    label: 'text-rose-700 font-semibold',
    description: 'text-rose-500',
    connector: 'bg-rose-300',
  },
  disabled: {
    circle: 'bg-slate-100 text-slate-400 border-2 border-slate-200',
    label: 'text-slate-400',
    description: 'text-slate-300',
    connector: 'bg-slate-200',
  },
};

function resolveStatus(currentStep, stepIndex, step, hasError) {
  if (step.status) {
    return step.status;
  }
  if (hasError && stepIndex === currentStep) {
    return 'error';
  }
  if (step.disabled) {
    return 'disabled';
  }
  if (stepIndex < currentStep) {
    return 'complete';
  }
  if (stepIndex === currentStep) {
    return 'active';
  }
  return 'pending';
}

const Steps = forwardRef(function Steps(
  {
    steps = [],
    currentStep = 0,
    orientation = 'horizontal',
    size = 'md',
    clickable = false,
    error = false,
    showDescription = true,
    className = '',
    stepClassName = '',
    connectorClassName = '',
    onStepClick,
    testId,
    ...rest
  },
  ref
) {
  const orientationConfig = ORIENTATIONS[orientation] || ORIENTATIONS.horizontal;
  const sizeConfig = SIZES[size] || SIZES.md;

  return (
    <div
      ref={ref}
      className={[orientationConfig.container, className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {steps.map((step, index) => {
        const status = resolveStatus(currentStep, index, step, error);
        const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.pending;
        const isLast = index === steps.length - 1;
        const isClickable = clickable && !step.disabled && onStepClick;

        const stepContent = (
          <>
            <div
              className={[
                'flex shrink-0 items-center justify-center rounded-full font-semibold transition-colors duration-200',
                sizeConfig.circle,
                statusConfig.circle,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {status === 'complete' ? (
                <Check size={sizeConfig.icon} aria-hidden="true" />
              ) : step.icon ? (
                <step.icon size={sizeConfig.icon} aria-hidden="true" />
              ) : (
                <span className={sizeConfig.number}>{index + 1}</span>
              )}
            </div>

            {orientation === 'horizontal' ? (
              <div className={[orientationConfig.body, 'ml-3']].filter(Boolean).join(' ')}>
                <span className={[sizeConfig.label, statusConfig.label].filter(Boolean).join(' ')}>
                  {step.label}
                </span>
                {showDescription && step.description ? (
                  <span
                    className={[sizeConfig.description, statusConfig.description]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {step.description}
                  </span>
                ) : null}
              </div>
            ) : (
              <div className={[orientationConfig.body, 'ml-3 pb-8'].filter(Boolean).join(' ')}>
                <span className={[sizeConfig.label, statusConfig.label].filter(Boolean).join(' ')}>
                  {step.label}
                </span>
                {showDescription && step.description ? (
                  <span
                    className={[sizeConfig.description, statusConfig.description]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {step.description}
                  </span>
                ) : null}
              </div>
            )}
          </>
        );

        return (
          <React.Fragment key={step.key || step.label || index}>
            {isClickable ? (
              <button
                type="button"
                onClick={() => onStepClick(index, step)}
                className={[
                  orientationConfig.step,
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-md',
                  stepClassName,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={status === 'active' ? 'step' : undefined}
              >
                {stepContent}
              </button>
            ) : (
              <div
                className={[orientationConfig.step, stepClassName].filter(Boolean).join(' ')}
                aria-current={status === 'active' ? 'step' : undefined}
              >
                {stepContent}
              </div>
            )}

            {!isLast ? (
              <div
                className={[
                  orientationConfig.connector,
                  statusConfig.connector,
                  orientation === 'horizontal' ? 'mx-2' : 'my-0 ml-4',
                  connectorClassName,
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
});

Steps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node.isRequired,
      description: PropTypes.node,
      icon: PropTypes.elementType,
      disabled: PropTypes.bool,
      status: PropTypes.oneOf(['complete', 'active', 'pending', 'error', 'disabled']),
    })
  ).isRequired,
  currentStep: PropTypes.number,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  clickable: PropTypes.bool,
  error: PropTypes.bool,
  showDescription: PropTypes.bool,
  className: PropTypes.string,
  stepClassName: PropTypes.string,
  connectorClassName: PropTypes.string,
  onStepClick: PropTypes.func,
  testId: PropTypes.string,
};

export default Steps;
export { ORIENTATIONS as STEPS_ORIENTATIONS, SIZES as STEPS_SIZES };