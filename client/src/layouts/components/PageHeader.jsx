/**
 * PageHeader
 *
 * Consistent header block used at the top of every authenticated page.
 * Includes breadcrumbs, title, description, and optional action area.
 *
 * @module client/src/layouts/components/PageHeader
 */

import { cn } from '../../lib/utils/cn.util.js';
import Breadcrumbs from './Breadcrumbs.jsx';

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  children,
}) {
  return (
    <div className={cn('flex flex-col gap-4 pb-6', className)}>
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-h2 font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-small text-text-secondary">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}