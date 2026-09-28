import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

export default function BlinkQrCode({ url, size = 240, className = '' }) {
  const imageUrl = useMemo(() => {
    if (!url) {
      return null;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  }, [url, size]);

  if (!imageUrl) {
    return null;
  }

  return (
    <div className={['flex flex-col items-center gap-2', className].filter(Boolean).join(' ')}>
      <img
        src={imageUrl}
        alt="Blink QR code"
        width={size}
        height={size}
        className="rounded-md border border-slate-200 bg-white"
      />
      <p className="text-[11px] text-slate-400">Scan to open the Blink</p>
    </div>
  );
}

BlinkQrCode.propTypes = {
  url: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
};