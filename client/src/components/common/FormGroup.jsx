/**
 * FormGroup
 *
 * Wraps a form control with a label, optional hint, error message, and
 * consistent vertical spacing. Used across every form in the app so
 * field layout stays consistent.
 *
 * @module client/src/components/common/FormGroup
 */

import Label from './Label.jsx';
import clsx from 'clsx';

export default function FormGroup({
  htmlFor,
  label,
  required = false,
  optional = false,
  hint,
  error,
  suffix,
  description,
  children,
  className,
  contentClassName,
  inline = false,
}) {
  return (
    <div className={clsx('w-full', className)}>
      {label ? (
        <Label
          htmlFor={htmlFor}
          required={required}
          optional={optional}
          hint={hint}
          suffix={suffix}
        >
          {label}
        </Label>
      ) : null}

      <div className={clsx(inline && 'flex items-center gap-3', contentClassName)}>{children}</div>

      {description && !error ? (
        <p className="mt-1.5 text-caption text-text-tertiary">{description}</p>
      ) : null}

      {error ? <p className="mt-1.5 text-caption text-error">{error}</p> : null}
    </div>
  );
}