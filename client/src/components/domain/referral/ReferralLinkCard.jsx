import React, { forwardRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Link2, Copy, Check, Share2, Mail, MessageCircle } from 'lucide-react';
import Card from '../../common/Card';
import Button from '../../common/Button';

const ReferralLinkCard = forwardRef(function ReferralLinkCard(
  {
    referralCode,
    referralLink,
    onCopy,
    onShare,
    shareChannels = ['copy', 'email', 'whatsapp'],
    title = 'Your Referral Link',
    description = 'Share this link and earn rewards on the trading performance of traders you refer.',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!referralLink) {
      return;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = referralLink;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (onCopy) {
        onCopy(referralLink);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      // silent
    }
  }, [referralLink, onCopy]);

  const shareVia = (channel) => {
    const text = encodeURIComponent(
      `Join me on SignalForge AI — the AI-powered trading intelligence platform. Use my referral link:`
    );
    const url = encodeURIComponent(referralLink || '');

    let target = '';
    if (channel === 'email') {
      target = `mailto:?subject=Join SignalForge AI&body=${text}%20${url}`;
    } else if (channel === 'whatsapp') {
      target = `https://wa.me/?text=${text}%20${url}`;
    } else if (channel === 'telegram') {
      target = `https://t.me/share/url?url=${url}&text=${text}`;
    }

    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer');
      if (onShare) {
        onShare(channel);
      }
    }
  };

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Link2 size={20} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>

      {referralCode ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Referral Code
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold tracking-wider text-slate-900">
            {referralCode}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
          <Link2 size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
            {referralLink}
          </code>
        </div>

        <Button
          variant="primary"
          onClick={handleCopy}
          leadingIcon={copied ? Check : Copy}
          className="shrink-0"
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      {shareChannels.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Share via:</span>
          {shareChannels.includes('email') ? (
            <button
              type="button"
              onClick={() => shareVia('email')}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Mail size={12} aria-hidden="true" />
              Email
            </button>
          ) : null}
          {shareChannels.includes('whatsapp') ? (
            <button
              type="button"
              onClick={() => shareVia('whatsapp')}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <MessageCircle size={12} aria-hidden="true" />
              WhatsApp
            </button>
          ) : null}
          {shareChannels.includes('telegram') ? (
            <button
              type="button"
              onClick={() => shareVia('telegram')}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Share2 size={12} aria-hidden="true" />
              Telegram
            </button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
});

ReferralLinkCard.propTypes = {
  referralCode: PropTypes.string,
  referralLink: PropTypes.string,
  onCopy: PropTypes.func,
  onShare: PropTypes.func,
  shareChannels: PropTypes.arrayOf(PropTypes.oneOf(['copy', 'email', 'whatsapp', 'telegram'])),
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ReferralLinkCard;