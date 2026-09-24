/**
 * Badge
 *
 * Compact label for statuses, counts, tags, and inline indicators.
 * Supports 9 visual tones, 3 sizes, optional leading icon and dot,
 * and a `pill` variant used across dashboard tables.
 *
 * @module client/src/components/common/Badge
 */

import clsx from 'clsx';

const TONES = {
  neutral: 'bg-surface-elevated text-text-secondary border-surface-border',
  primary: 'bg-primary-500/15 text-primary-300 border-primary-500/30',
  accent: 'bg-accent-500/15 text-accent border-accent-500/30',
  success: 'bg-success-subtle text-success border-success/30',
  warning: 'bg-warning-subtle text-warning border-warning/30',
  error: 'bg-error-subtle text-error border-error/30',
  info: 'bg-info-subtle text-info border-info/30',
  buy: 'bg-buy-subtle text-buy border-success/30',
  sell: 'bg-sell-subtle text-sell border-error/30',
  live: 'bg-success-subtle text-success border-success/30',
  demo: 'bg-warning-subtle text-warning border-warning/30',
  premium: 'bg-gradient-primary text-white border-transparent',
};

const SIZES = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-caption px-2 py-0.5',
  lg: 'text-small px-2.5 py-1',
};

export default function Badge({
  children,
  tone = 'neutral',
  size = 'md',
  pill = true,
  dot = false,
  icon: Icon,
  className,
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 border font-medium',
        TONES[tone] || TONES.neutral,
        SIZES[size] || SIZES.md,
        pill ? 'rounded-full' : 'rounded-md',
        className,
      )}
    >
      {dot ? <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}