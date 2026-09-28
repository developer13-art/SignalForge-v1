import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check, QrCode, Share2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { getBlinkShareLinks } from '../../../api/solana-blinks.api';

const CHANNELS = [
  { key: 'x', label: 'X (Twitter)' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email', label: 'Email' },
  { key: 'direct', label: 'Direct link' },
];

export default function BlinkShareDialog({ open, onClose, blink, text, via, hashtags }) {
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    if (!open || !blink?.id) {
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getBlinkShareLinks(blink.id, { text, via, hashtags });
        if (!cancelled) {
          setLinks(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Failed to generate links');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [open, blink?.id, text, via, hashtags]);

  const copyToClipboard = useCallback(async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch (_error) {
      setCopiedKey(null);
    }
  }, []);

  if (!blink) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share Blink"
      description={`Share "${blink.title}" across your channels.`}
      size="md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Close
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : error ? (
        <p className="py-6 text-center text-sm text-rose-600">{error}</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Share2 size={12} />
              Blink URL
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={links?.blinkUrl || ''}
                className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(links?.blinkUrl, 'blinkUrl')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100"
                aria-label="Copy Blink URL"
              >
                {copiedKey === 'blinkUrl' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {CHANNELS.map((channel) => {
              const link = links?.shareLinks?.[channel.key];
              const disabled = !link;

              return (
                <div
                  key={channel.key}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2"
                >
                  <span className="text-sm font-medium text-slate-700">{channel.label}</span>

                  <div className="flex items-center gap-2">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={[
                        'text-xs font-medium',
                        disabled
                          ? 'cursor-not-allowed text-slate-300'
                          : 'text-indigo-600 hover:text-indigo-800 hover:underline',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-disabled={disabled}
                      onClick={(event) => {
                        if (disabled) {
                          event.preventDefault();
                        }
                      }}
                    >
                      Open
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(link, channel.key)}
                      disabled={disabled}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Copy ${channel.label} link`}
                    >
                      {copiedKey === channel.key ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {links?.qrImageUrl ? (
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <QrCode size={12} />
                QR code
              </div>
              <div className="mt-3 flex justify-center">
                <img
                  src={links.qrImageUrl}
                  alt="Blink QR code"
                  className="h-40 w-40 rounded-md border border-slate-200"
                />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
}

BlinkShareDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  blink: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
  }),
  text: PropTypes.string,
  via: PropTypes.string,
  hashtags: PropTypes.arrayOf(PropTypes.string),
};