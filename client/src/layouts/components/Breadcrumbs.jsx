/**
 * Breadcrumbs
 *
 * Renders the breadcrumb trail for the currently active route. When no
 * explicit trail is provided, derives one from the URL.
 *
 * @module client/src/layouts/components/Breadcrumbs
 */

import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils/cn.util.js';

function titleCaseSegment(segment) {
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function Breadcrumbs({ items, className }) {
  const crumbs =
    Array.isArray(items) && items.length > 0
      ? items
      : typeof window !== 'undefined'
        ? window.location.pathname
            .split('/')
            .filter(Boolean)
            .map((segment, index, array) => ({
              label: titleCaseSegment(segment),
              to: `/${array.slice(0, index + 1).join('/')}`,
            }))
        : [];

  return (
    <nav
      className={cn('flex items-center gap-1 text-caption text-text-tertiary', className)}
      aria-label="Breadcrumb"
    >
      <Link
        to="/dashboard"
        className="flex items-center gap-1 transition-colors hover:text-text-primary"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-text-tertiary" />
            {isLast || !crumb.to ? (
              <span className="font-medium text-text-secondary">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.to}
                className="transition-colors hover:text-text-primary"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}