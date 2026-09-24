/**
 * Label
 *
 * Semantic form label with required indicator, hint tooltip, and
 * accessibility support. Also supports a suffix slot for inline
 * actions such as a "Forgot password?" link.
 *
 * @module client/src/components/common/Label
 */

import { HelpCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Label({
  htmlFor,
  children,
  required = false,
  optional = false,
  hint,
  suffix,
  size = 'md',
  tone = 'default',
  className,
}) {
  const sizeClass = size === 'sm' ? 'text-caption' : 'text-small';
  const toneClass = tone === 'muted' ? 'text-text-tertiary' : 'text-text-secondary';

  return (
    <div className={clsx('mb-1.5 flex items-center justify-between gap-2', className)}>
      <label
        htmlFor={htmlFor}
        className={clsx('inline-flex items-center gap-1 font-medium', sizeClass, toneClass)}
      >
        <span>{children}</span>
        {required ? <span className="text-error">*</span> : null}
        {optional ? (
          <span className="ml-1 text-caption font-normal text-text-tertiary">(optional)</span>
        ) : null}
        {hint ? (
          <span className="group relative inline-flex">
            <HelpCircle className="h-3.5 w-3.5 text-text-tertiary transition group-hover:text-text-secondary" />
            <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-30 w-56 -translate-x-1/2 rounded-lg border border-surface-border bg-surface px-3 py-2 text-caption text-text-secondary opacity-0 shadow-modal transition group-hover:opacity-100">
              {hint}
            </span>
          </span>
        ) : null}
      </label>
      {suffix ? <div className="text-caption">{suffix}</div> : null}
    </div>
  );
}