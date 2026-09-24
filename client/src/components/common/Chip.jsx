/**
 * Chip
 *
 * Interactive chip used for filters, tags, and multi-select values.
 * Supports selection state, removable, click and keyboard handling,
 * and optional leading avatar/icon.
 *
 * @module client/src/components/common/Chip
 */

import { X } from 'lucide-react';
import clsx from 'clsx';

export default function Chip({
  label,
  children,
  selected = false,
  onClick,
  onRemove,
  icon: Icon,
  avatarSrc,
  disabled = false,
  size = 'md',
  tone = 'default',
  className,
}) {
  const content = label || children;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : size === 'lg' ? 'text-small px-3 py-1.5' : 'text-caption px-2.5 py-1';

  const toneClass = selected
    ? 'bg-primary text-white border-primary'
    : tone === 'success'
    ? 'bg-success-subtle text-success border-success/30'
    : tone === 'warning'
    ? 'bg-warning-subtle text-warning border-warning/30'
    : 'bg-surface text-text-secondary border-surface-border hover:border-primary-500 hover:text-text-primary';

  const interactive = typeof onClick === 'function';

  return (
    <span
      role={interactive ? 'button' : undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      onClick={interactive && !disabled ? onClick : undefined}
      onKeyDown={
        interactive && !disabled
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border transition select-none',
        sizeClass,
        toneClass,
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {avatarSrc ? (
        <img src={avatarSrc} alt="" className="h-4 w-4 rounded-full object-cover" />
      ) : null}
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span className="whitespace-nowrap">{content}</span>
      {typeof onRemove === 'function' ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(event);
          }}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-current opacity-70 transition hover:opacity-100"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  );
}