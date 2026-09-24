import React, { forwardRef, useId } from 'react';
import PropTypes from 'prop-types';
import { useFormContext } from './Form';

const FormField = forwardRef(function FormField(
  {
    name,
    label,
    description,
    required = false,
    disabled = false,
    showError = true,
    showLabel = true,
    htmlFor,
    children,
    className = '',
    labelClassName = '',
    descriptionClassName = '',
    errorClassName = '',
    render,
    testId,
    ...rest
  },
  ref,
) {
  let context = null;
  try {
    context = useFormContext();
  } catch (error) {
    context = null;
  }

  const generatedId = useId();
  const fieldId = htmlFor || `${name || 'field'}-${generatedId}`;

  const fieldError = context && name ? context.errors[name] : null;
  const isTouched = context && name ? context.touched[name] : false;

  const resolvedError =
    typeof fieldError === 'string'
      ? fieldError
      : fieldError && typeof fieldError === 'object'
      ? fieldError.message
      : null;

  const shouldShowError = showError && isTouched && resolvedError;

  const handleBlur = () => {
    if (context && name) {
      context.setFieldTouched(name, true);
    }
  };

  const handleChange = (value) => {
    if (context && name) {
      context.setFieldValue(name, value);
    }
  };

  const inputProps = {
    id: fieldId,
    name,
    disabled: disabled || (context && context.submitting),
    'aria-invalid': shouldShowError ? 'true' : undefined,
    'aria-describedby': description ? `${fieldId}-description` : undefined,
    onBlur: handleBlur,
    onChange: handleChange,
    value: context && name ? context.values[name] : undefined,
  };

  const content = render
    ? render({
        ...inputProps,
        error: shouldShowError ? resolvedError : null,
      })
    : React.isValidElement(children)
    ? React.cloneElement(children, { ...inputProps, ...children.props })
    : children;

  return (
    <div
      ref={ref}
      className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showLabel && label ? (
        <label
          htmlFor={fieldId}
          className={[
            'text-sm font-medium text-slate-700',
            disabled ? 'opacity-60' : '',
            labelClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>
      ) : null}

      {description ? (
        <p
          id={`${fieldId}-description`}
          className={['text-xs text-slate-500', descriptionClassName].filter(Boolean).join(' ')}
        >
          {description}
        </p>
      ) : null}

      {content}

      {shouldShowError ? (
        <p
          role="alert"
          className={['text-xs font-medium text-rose-600', errorClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {resolvedError}
        </p>
      ) : null}
    </div>
  );
});

FormField.propTypes = {
  name: PropTypes.string,
  label: PropTypes.node,
  description: PropTypes.node,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  showError: PropTypes.bool,
  showLabel: PropTypes.bool,
  htmlFor: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  descriptionClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  render: PropTypes.func,
  testId: PropTypes.string,
};

export default FormField;