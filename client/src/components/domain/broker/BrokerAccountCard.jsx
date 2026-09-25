import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Server, User, Lock, Wifi, WifiOff, Settings2, RefreshCw } from 'lucide-react';
import Card from '../../common/Card';
import EnvironmentBadge from './EnvironmentBadge';
import BrokerConnectionStatus from './BrokerConnectionStatus';

const BrokerAccountCard = forwardRef(function BrokerAccountCard(
  {
    account,
    onClick,
    onRefresh,
    onConfigure,
    onDisconnect,
    compact = false,
    showServer = true,
    showLogin = true,
    showBalance = true,
    showEquity = true,
    actions,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!account) {
    return null;
  }

  const {
    broker,
    platform,
    server,
    login,
    nickname,
    accountType,
    status,
    connected,
    balance,
    equity,
    margin,
    freeMargin,
    currency = 'USD',
    lastSync,
    connectionQuality,
  } = account;

  return (
    <Card
      ref={ref}
      variant="default"
      padding={compact ? 'sm' : 'md'}
      hoverable={Boolean(onClick)}
      clickable={Boolean(onClick)}
      onClick={onClick}
      className={className}
      testId={testId}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              'flex h-10 w-10 items-center justify-center rounded-lg',
              accountType === 'live'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-sky-100 text-sky-700',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Server size={18} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                {nickname || broker || 'Broker Account'}
              </h3>
              <EnvironmentBadge environment={accountType} size="xs" />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {broker} · {platform}
            </p>
          </div>
        </div>

        <BrokerConnectionStatus status={status || (connected ? 'connected' : 'disconnected')} size="sm" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
        {showServer && server ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Server
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{server}</p>
          </div>
        ) : null}

        {showLogin && login ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Login
            </p>
            <p className="mt-0.5 flex items-center gap-1 font-mono text-sm font-medium text-slate-900">
              <User size={12} aria-hidden="true" />
              {login}
            </p>
          </div>
        ) : null}

        {showBalance && balance !== undefined ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Balance
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {currency} {balance}
            </p>
          </div>
        ) : null}

        {showEquity && equity !== undefined ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Equity
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {currency} {equity}
            </p>
          </div>
        ) : null}
      </div>

      {margin !== undefined || freeMargin !== undefined ? (
        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          {margin !== undefined ? (
            <span className="flex items-center gap-1">
              <Lock size={10} aria-hidden="true" />
              Margin: <strong className="font-semibold text-slate-700">{margin}</strong>
            </span>
          ) : null}
          {freeMargin !== undefined ? (
            <span className="flex items-center gap-1">
              Free: <strong className="font-semibold text-slate-700">{freeMargin}</strong>
            </span>
          ) : null}
        </div>
      ) : null}

      {(lastSync || connectionQuality) ? (
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          {lastSync ? <span>Last sync: {lastSync}</span> : null}
          {connectionQuality ? (
            <span className="flex items-center gap-1">
              {connected ? (
                <Wifi size={10} className="text-emerald-500" aria-hidden="true" />
              ) : (
                <WifiOff size={10} className="text-rose-500" aria-hidden="true" />
              )}
              {connectionQuality}
            </span>
          ) : null}
        </div>
      ) : null}

      {actions || onRefresh || onConfigure || onDisconnect ? (
        <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-3">
          {actions}
          {onRefresh ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRefresh(event);
              }}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Refresh"
            >
              <RefreshCw size={14} aria-hidden="true" />
            </button>
          ) : null}
          {onConfigure ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onConfigure(event);
              }}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Configure"
            >
              <Settings2 size={14} aria-hidden="true" />
            </button>
          ) : null}
          {onDisconnect ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDisconnect(event);
              }}
              className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
            >
              Disconnect
            </button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
});

BrokerAccountCard.propTypes = {
  account: PropTypes.shape({
    broker: PropTypes.string,
    platform: PropTypes.string,
    server: PropTypes.string,
    login: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nickname: PropTypes.string,
    accountType: PropTypes.oneOf(['live', 'demo']),
    status: PropTypes.string,
    connected: PropTypes.bool,
    balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    equity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    freeMargin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
    lastSync: PropTypes.string,
    connectionQuality: PropTypes.string,
  }),
  onClick: PropTypes.func,
  onRefresh: PropTypes.func,
  onConfigure: PropTypes.func,
  onDisconnect: PropTypes.func,
  compact: PropTypes.bool,
  showServer: PropTypes.bool,
  showLogin: PropTypes.bool,
  showBalance: PropTypes.bool,
  showEquity: PropTypes.bool,
  actions: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default BrokerAccountCard;