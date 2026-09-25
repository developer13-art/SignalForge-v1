import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Wallet, LogOut, Loader2, ExternalLink } from 'lucide-react';

const SIZES = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3 py-1.5 text-sm gap-2',
  lg: 'px-4 py-2 text-base gap-2.5',
};

const VARIANTS = {
  primary: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700',
  outline: 'border border-violet-300 bg-white text-violet-700 hover:bg-violet-50',
  ghost: 'text-violet-700 hover:bg-violet-50',
  dark: 'bg-slate-900 text-white hover:bg-slate-800',
};

function truncateAddress(address) {
  if (!address) {
    return '';
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

const WalletConnectButton = forwardRef(function WalletConnectButton(
  {
    connected = false,
    connecting = false,
    walletAddress,
    walletName,
    onConnect,
    onDisconnect,
    onViewExplorer,
    size = 'md',
    variant = 'primary',
    showIcon = true,
    showAddress = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const sizeClass = SIZES[size] || SIZES.md;
  const variantClass = VARIANTS[variant] || VARIANTS.primary;

  const handleClick = (event) => {
    if (connecting) {
      return;
    }
    if (connected) {
      if (onDisconnect) {
        onDisconnect(event);
      }
    } else if (onConnect) {
      onConnect(event);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      disabled={connecting}
      className={[
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
        sizeClass,
        variantClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? (
        connecting ? (
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        ) : connected ? (
          <LogOut size={14} aria-hidden="true" />
        ) : (
          <Wallet size={14} aria-hidden="true" />
        )
      ) : null}

      <span>
        {connecting
          ? 'Connecting...'
          : connected
          ? showAddress && walletAddress
            ? truncateAddress(walletAddress)
            : walletName || 'Connected'
          : 'Connect Wallet'}
      </span>

      {connected && onViewExplorer ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewExplorer(walletAddress);
          }}
          aria-label="View on explorer"
          className="ml-1 rounded p-0.5 hover:bg-white/15"
        >
          <ExternalLink size={11} aria-hidden="true" />
        </button>
      ) : null}
    </button>
  );
});

WalletConnectButton.propTypes = {
  connected: PropTypes.bool,
  connecting: PropTypes.bool,
  walletAddress: PropTypes.string,
  walletName: PropTypes.string,
  onConnect: PropTypes.func,
  onDisconnect: PropTypes.func,
  onViewExplorer: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'outline', 'ghost', 'dark']),
  showIcon: PropTypes.bool,
  showAddress: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default WalletConnectButton;