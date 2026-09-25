import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Download, Printer, CheckCircle2, Receipt, Calendar, CreditCard, Hash } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import PaymentStatusBadge from './PaymentStatusBadge';

const PaymentReceipt = forwardRef(function PaymentReceipt(
  {
    payment,
    onDownload,
    onPrint,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!payment) {
    return null;
  }

  const {
    reference,
    date,
    status,
    amount,
    currency = 'USD',
    method,
    description,
    customer,
    breakdown,
    transactionId,
  } = payment;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Payment Receipt</h2>
            <p className="text-xs text-slate-500">Reference: {reference}</p>
          </div>
        </div>

        {status ? <PaymentStatusBadge status={status} size="md" /> : null}
      </div>

      <Separator spacing="md" />

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {date ? (
          <div>
            <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <Calendar size={10} aria-hidden="true" />
              Payment Date
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{date}</dd>
          </div>
        ) : null}

        {method ? (
          <div>
            <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <CreditCard size={10} aria-hidden="true" />
              Payment Method
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{method}</dd>
          </div>
        ) : null}

        {transactionId ? (
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <Hash size={10} aria-hidden="true" />
              Transaction ID
            </dt>
            <dd className="mt-1 font-mono text-xs font-medium text-slate-800">{transactionId}</dd>
          </div>
        ) : null}

        {customer ? (
          <div className="sm:col-span-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Billed To
            </dt>
            <dd className="mt-1">
              <p className="text-sm font-medium text-slate-800">{customer.name}</p>
              {customer.email ? (
                <p className="text-xs text-slate-500">{customer.email}</p>
              ) : null}
            </dd>
          </div>
        ) : null}
      </dl>

      <Separator spacing="md" />

      {description ? (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h3>
          <p className="mt-1 text-sm text-slate-700">{description}</p>
        </div>
      ) : null}

      {breakdown && breakdown.length > 0 ? (
        <>
          <Separator spacing="sm" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Breakdown
          </h3>
          <dl className="mt-2 space-y-1.5">
            {breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-slate-600">{item.label}</dt>
                <dd className="font-medium text-slate-800">
                  {currency} {item.amount}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      <Separator spacing="md" />

      <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-700">Total Paid</p>
        <p className="text-lg font-bold text-slate-900">
          {currency} {amount}
        </p>
      </div>

      {(onDownload || onPrint) ? (
        <>
          <Separator spacing="md" />
          <div className="flex flex-wrap items-center gap-2">
            {onDownload ? (
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Download size={14} aria-hidden="true" />
                Download PDF
              </button>
            ) : null}

            {onPrint ? (
              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Printer size={14} aria-hidden="true" />
                Print
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-slate-400">
        <Receipt size={10} aria-hidden="true" />
        This is an official receipt from SignalForge AI
      </p>
    </Card>
  );
});

PaymentReceipt.propTypes = {
  payment: PropTypes.shape({
    reference: PropTypes.string,
    date: PropTypes.string,
    status: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
    method: PropTypes.string,
    description: PropTypes.string,
    customer: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    breakdown: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
    transactionId: PropTypes.string,
  }),
  onDownload: PropTypes.func,
  onPrint: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PaymentReceipt;