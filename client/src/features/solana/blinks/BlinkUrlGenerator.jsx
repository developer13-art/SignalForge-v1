import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check, Link2 } from 'lucide-react';

function buildUrl({ templateType, planId, referralCode, providerId, token, amount, utm }) {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://signalforge.ai';
  const params = new URLSearchParams();

  if (planId) {
    params.set('planId', planId);
  }
  if (referralCode) {
    params.set('referralCode', referralCode);
  }
  if (providerId) {
    params.set('providerId', providerId);
  }
  if (token) {
    params.set('token', token);
  }
  if (amount !== undefined && amount !== null && amount !== '') {
    params.set('amount', String(amount));
  }
  if (utm && utm.source) {
    params.set('utm_source', utm.source);
  }
  if (utm && utm.medium) {
    params.set('utm_medium', utm.medium);
  }
  if (utm && utm.campaign) {
    params.set('utm_campaign', utm.campaign);
  }

  const query = params.toString();
  return `${base}/api/actions/${templateType}${query ? `?${query}` : ''}`;
}

export default function BlinkUrlGenerator({
  templateType = 'subscribe',
  planId,
  referralCode,
  providerId,
  token,
  amount,
  utm,
  showQr = false,
}) {
  const [copied, setCopied] = useState(false);

  const url = useMemo(
    () => buildUrl({ templateType, planId, referralCode, providerId, token, amount, utm }),
    [templateType, planId, referralCode, providerId, token, amount, utm],
  );

  const qrImageUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`,
    [url],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_error) {
      setCopied(false);
    }
  }, [url]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Link2 size={12} />
        Blink URL
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          onFocus={(event) => event.target.select()}
          className="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100"
          aria-label="Copy URL"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {showQr ? (
        <div className="flex justify-center pt-2">
          <img
            src={qrImageUrl}
            alt="Blink QR code"
            className="h-40 w-40 rounded-md border border-slate-200"
          />
        </div>
      ) : null}
    </div>
  );
}

BlinkUrlGenerator.propTypes = {
  templateType: PropTypes.string,
  planId: PropTypes.string,
  referralCode: PropTypes.string,
  providerId: PropTypes.string,
  token: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  utm: PropTypes.shape({
    source: PropTypes.string,
    medium: PropTypes.string,
    campaign: PropTypes.string,
  }),
  showQr: PropTypes.bool,
};