import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import Card from '../../common/Card';

const CREDIT_TYPES = ['credit', 'referral', 'refund', 'deposit', 'reward'];

const WalletTransactionCard = forwardRef(function WalletTransactionCard(
  {
    transaction,
    onClick,
    currency = 'USD',
    showReference = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!transaction) {
    return null;
  }

  const { type, amount, description, reference, date, status, balance } = transaction;
  const isCredit = CREDIT_TYPES.includes(type);

  return (
    <Card
      ref={ref}
      padding="md"
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
              'flex h-9 w-9 items-center justify-center rounded-full',
              isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isCredit ? (
              <ArrowUpRight size={16} aria-hidden="true" />
            ) : (
              <ArrowDownRight size={16} aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0">
            <p className="text-sm font-semibold capitalize text-slate-900">{type}</p>
            {description ? (
              <p className="mt-0.5 truncate text-xs text-slate-500">{description}</p>
            ) : null}
            {showReference && reference ? (
              <p className="mt-0.5 font-mono text-[11px] text-slate-400">{reference}</p>
            ) : null}
          </div>
        </div>

        <div className="text-right">
          <p
            className={[
              'text-base font-bold',
              isCredit ? 'text-emerald-600' : 'text-rose-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isCredit ? '+' : '-'}
            {currency} {amount}
          </p>

          {balance !== undefined ? (
            <p className="mt-0.5 text-[11px] text-slate-500">
              Balance: {currency} {balance}
            </p>
          ) : null}

          <div className="mt-1 flex items-center justify-end gap-1 text-[11px]">
            {status === 'completed' ? (
              <>
                <CheckCircle2 size={10} className="text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-600">Completed</span>
              </>
            ) : status === 'pending' ? (
              <>
                <Clock size={10} className="text-amber-600" aria-hidden="true" />
                <span className="text-amber-600">Pending</span>
              </>
            ) : date ? (
              <span className="text-slate-400">{date}</span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
});

WalletTransactionCard.propTypes = {
  transaction: PropTypes.shape({
    type: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    reference: PropTypes.string,
    date: PropTypes.string,
    status: PropTypes.string,
    balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onClick: PropTypes.func,
  currency: PropTypes.string,
  showReference: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default WalletTransactionCard;