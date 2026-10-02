/**
 * FormField
 *
 * Wraps a single form control with its label, description, and error
 * message. Supports three usage patterns:
 *
 *   1. render prop:
 *        <FormField label="Email" render={(props) => <Input {...props} />} />
 *
 *   2. children as a React element (FormField clones it and injects props):
 *        <FormField label="Email"><Input /></FormField>
 *
 *   3. children as a function (FormField calls it with the resolved props):
 *        <FormField label="Email">
 *          {({ id, error }) => <Input id={id} error={error} />}
 *        </FormField>
 *
 * @module client/src/components/forms/FormField
 */

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
  } catch (_error) {
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
      const fieldValue = value?.target
        ? value.target.type === 'checkbox'
          ? value.target.checked
          : value.target.value
        : value;
      context.setFieldValue(name, fieldValue);
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

  const resolvedErrorForChild = shouldShowError ? resolvedError : null;

  let content;

  if (render) {
    content = render({
      ...inputProps,
      error: resolvedErrorForChild,
    });
  } else if (typeof children === 'function') {
    content = children({
      ...inputProps,
      error: resolvedErrorForChild,
    });
  } else if (React.isValidElement(children)) {
    content = React.cloneElement(children, { ...inputProps, ...children.props });
  } else {
    content = children;
  }

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
            'text-small font-medium text-text-secondary',
            disabled ? 'opacity-60' : '',
            labelClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
          {required ? <span className="ml-0.5 text-error">*</span> : null}
        </label>
      ) : null}

      {description ? (
        <p
          id={`${fieldId}-description`}
          className={['text-caption text-text-tertiary', descriptionClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </p>
      ) : null}

      {content}

      {shouldShowError ? (
        <p
          role="alert"
          className={['text-caption font-medium text-error', errorClassName]
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
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  descriptionClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  render: PropTypes.func,
  testId: PropTypes.string,
};

export default FormField;