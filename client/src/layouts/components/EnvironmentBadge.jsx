/**
 * EnvironmentBadge
 *
 * Compact indicator of the currently active trading environment
 * (demo, live, or admin override). The dot color and label follow the
 * design system's status palette.
 *
 * @module client/src/layouts/components/EnvironmentBadge
 */

import { useSelector } from 'react-redux';
import { cn } from '../../lib/utils/cn.util.js';
import { selectCurrentUser } from '../../store/selectors/auth.selectors.js';

export default function EnvironmentBadge({ environment, className }) {
  const currentUser = useSelector(selectCurrentUser);

  const resolvedEnvironment =
    environment ||
    currentUser?.tradingEnvironment ||
    currentUser?.activeBrokerAccountType ||
    'DEMO';

  const config = {
    LIVE: { label: 'Live Trading', dot: 'bg-success', text: 'text-success' },
    DEMO: { label: 'Demo Trading', dot: 'bg-info', text: 'text-info' },
    CONTEST: { label: 'Contest', dot: 'bg-warning', text: 'text-warning' },
  }[resolvedEnvironment] || { label: 'Demo Trading', dot: 'bg-info', text: 'text-info' };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-caption font-medium text-text-secondary transition-colors hover:border-primary-500/40 hover:text-text-primary',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden="true" />
      <span className={cn('text-caption font-medium', config.text)}>{config.label}</span>
    </button>
  );
}