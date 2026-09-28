import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ExternalLink, Zap } from 'lucide-react';

const DEFAULT_ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiM2MzY2ZjEiLz48L3N2Zz4=';

function safeIcon(iconUrl) {
  if (!iconUrl) {
    return DEFAULT_ICON;
  }
  if (/^https?:\/\//i.test(iconUrl) || /^data:image\//i.test(iconUrl)) {
    return iconUrl;
  }
  return DEFAULT_ICON;
}

export default function BlinkPreview({
  title = 'Subscribe to SignalForge',
  description = 'Activate your SignalForge subscription using Solana.',
  label = 'Subscribe',
  iconUrl,
  amount,
  tokenSymbol = 'USDC',
  website,
}) {
  const resolvedIcon = useMemo(() => safeIcon(iconUrl), [iconUrl]);

  const amountLabel = useMemo(() => {
    if (amount === undefined || amount === null || amount === '') {
      return null;
    }
    const numeric = Number(amount);
    if (Number.isNaN(numeric)) {
      return null;
    }
    return `${numeric.toLocaleString(undefined, { maximumFractionDigits: 9 })} ${tokenSymbol}`;
  }, [amount, tokenSymbol]);

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        <Zap size={12} />
        Blink preview
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-start gap-3 p-4">
          <img
            src={resolvedIcon}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
          />

          <div className="flex-1 space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{title}</h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">{description}</p>
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600"
              >
                <ExternalLink size={10} />
                {website.replace(/^https?:\/\//, '')}
              </a>
            ) : null}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-3">
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
            disabled
          >
            {label}
            {amountLabel ? <span className="ml-2 text-slate-300">· {amountLabel}</span> : null}
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-slate-400">
        This is how the Blink will appear when shared on X, Telegram, Discord, or in a wallet that
        supports Solana Actions.
      </p>
    </div>
  );
}

BlinkPreview.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  label: PropTypes.string,
  iconUrl: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tokenSymbol: PropTypes.string,
  website: PropTypes.string,
};