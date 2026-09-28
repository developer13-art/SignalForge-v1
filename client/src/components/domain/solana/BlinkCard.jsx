import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ExternalLink, Eye, MousePointerClick, TrendingUp, Copy, Pause, Play, Archive } from 'lucide-react';

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABELS = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
};

const TEMPLATE_LABELS = {
  subscribe: 'Subscription',
  upgrade: 'Upgrade',
  referral: 'Referral',
  tip: 'Tip',
};

function formatAmount(amount, symbol) {
  if (amount === undefined || amount === null) {
    return null;
  }
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return `${numeric.toLocaleString(undefined, { maximumFractionDigits: 9 })} ${symbol || ''}`.trim();
}

const BlinkCard = forwardRef(function BlinkCard(
  {
    blink,
    stats,
    onCopyUrl,
    onPause,
    onResume,
    onArchive,
    onViewDetails,
    onShare,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  if (!blink) {
    return null;
  }

  const statusClass = STATUS_STYLES[blink.status] || STATUS_STYLES.draft;
  const statusLabel = STATUS_LABELS[blink.status] || blink.status;
  const templateLabel = TEMPLATE_LABELS[blink.template_type] || blink.template_type;
  const amountLabel = formatAmount(blink.amount, blink.token_symbol);

  const shareCount = stats?.share_count || 0;
  const clickCount = stats?.click_count || 0;
  const conversionCount = stats?.conversion_count || 0;
  const confirmedAmount = stats?.total_amount || 0;

  return (
    <div
      ref={ref}
      className={[
        'flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-md',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {templateLabel}
            </span>
            <span
              className={[
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                statusClass,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {statusLabel}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{blink.title}</h3>
          <p className="line-clamp-2 text-xs text-slate-500">{blink.description}</p>
        </div>

        {blink.icon_url ? (
          <img
            src={blink.icon_url}
            alt=""
            className="h-10 w-10 shrink-0 rounded-md border border-slate-200 object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-4">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-slate-400" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400">Clicks</span>
            <span className="text-xs font-semibold text-slate-800">{clickCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MousePointerClick size={14} className="text-slate-400" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400">Shares</span>
            <span className="text-xs font-semibold text-slate-800">{shareCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-slate-400" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400">Conversions</span>
            <span className="text-xs font-semibold text-slate-800">{conversionCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-500" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400">Confirmed</span>
            <span className="text-xs font-semibold text-slate-800">
              {Number(confirmedAmount).toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
              {blink.token_symbol}
            </span>
          </div>
        </div>
      </div>

      {amountLabel ? (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-600">
          <span className="font-medium">Price: </span>
          {amountLabel}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-200 px-4 py-3">
        {onViewDetails ? (
          <button
            type="button"
            onClick={() => onViewDetails(blink)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Details
          </button>
        ) : null}

        {onCopyUrl ? (
          <button
            type="button"
            onClick={() => onCopyUrl(blink)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Copy size={12} aria-hidden="true" />
            Copy URL
          </button>
        ) : null}

        {onShare ? (
          <button
            type="button"
            onClick={() => onShare(blink)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ExternalLink size={12} aria-hidden="true" />
            Share
          </button>
        ) : null}

        {blink.status === 'active' && onPause ? (
          <button
            type="button"
            onClick={() => onPause(blink)}
            className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
          >
            <Pause size={12} aria-hidden="true" />
            Pause
          </button>
        ) : null}

        {blink.status === 'paused' && onResume ? (
          <button
            type="button"
            onClick={() => onResume(blink)}
            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <Play size={12} aria-hidden="true" />
            Resume
          </button>
        ) : null}

        {blink.status !== 'archived' && onArchive ? (
          <button
            type="button"
            onClick={() => onArchive(blink)}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Archive size={12} aria-hidden="true" />
            Archive
          </button>
        ) : null}
      </div>
    </div>
  );
});

BlinkCard.propTypes = {
  blink: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    template_type: PropTypes.string,
    status: PropTypes.string,
    icon_url: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    token_symbol: PropTypes.string,
  }),
  stats: PropTypes.shape({
    share_count: PropTypes.number,
    click_count: PropTypes.number,
    conversion_count: PropTypes.number,
    total_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onCopyUrl: PropTypes.func,
  onPause: PropTypes.func,
  onResume: PropTypes.func,
  onArchive: PropTypes.func,
  onViewDetails: PropTypes.func,
  onShare: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default BlinkCard;
export { STATUS_STYLES as BLINK_CARD_STATUS_STYLES, TEMPLATE_LABELS as BLINK_CARD_TEMPLATE_LABELS };