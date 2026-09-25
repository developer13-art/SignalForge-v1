import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Download, Receipt, Calendar, CreditCard } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';

const InvoiceCard = forwardRef(function InvoiceCard(
  {
    invoice,
    onDownload,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!invoice) {
    return null;
  }

  const {
    invoiceNumber,
    date,
    dueDate,
    status,
    amount,
    currency = 'USD',
    plan,
    items = [],
    subtotal,
    tax,
    total,
    paymentMethod,
  } = invoice;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Receipt size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-sm font-semibold text-slate-900">{invoiceNumber}</p>
            {plan ? <p className="text-xs text-slate-500">{plan}</p> : null}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {status ? <SubscriptionStatusBadge status={status} size="sm" /> : null}
          <p className="text-lg font-bold text-slate-900">
            {currency} {amount || total}
          </p>
        </div>
      </div>

      <Separator spacing="md" />

      <dl className="grid grid-cols-2 gap-4">
        {date ? (
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Issued
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <Calendar size={12} aria-hidden="true" />
              {date}
            </dd>
          </div>
        ) : null}

        {dueDate ? (
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Due
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <Calendar size={12} aria-hidden="true" />
              {dueDate}
            </dd>
          </div>
        ) : null}

        {paymentMethod ? (
          <div className="col-span-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Payment Method
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <CreditCard size={12} aria-hidden="true" />
              {paymentMethod}
            </dd>
          </div>
        ) : null}
      </dl>

      {items.length > 0 ? (
        <>
          <Separator spacing="md" />
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Items</h4>
          <ul className="mt-3 space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600">{item.description}</span>
                <span className="font-semibold text-slate-800">
                  {currency} {item.amount}
                </span>
              </li>
            ))}
          </ul>

          <Separator spacing="sm" />

          <dl className="space-y-1.5">
            {subtotal !== undefined ? (
              <div className="flex items-center justify-between text-sm">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-800">
                  {currency} {subtotal}
                </dd>
              </div>
            ) : null}

            {tax !== undefined ? (
              <div className="flex items-center justify-between text-sm">
                <dt className="text-slate-500">Tax</dt>
                <dd className="font-medium text-slate-800">
                  {currency} {tax}
                </dd>
              </div>
            ) : null}

            {total !== undefined ? (
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="font-bold text-slate-900">
                  {currency} {total}
                </dd>
              </div>
            ) : null}
          </dl>
        </>
      ) : null}

      {onDownload ? (
        <>
          <Separator spacing="md" />
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Download size={14} aria-hidden="true" />
            Download PDF
          </button>
        </>
      ) : null}
    </Card>
  );
});

InvoiceCard.propTypes = {
  invoice: PropTypes.shape({
    invoiceNumber: PropTypes.string,
    date: PropTypes.string,
    dueDate: PropTypes.string,
    status: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
    plan: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string,
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
    subtotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paymentMethod: PropTypes.string,
  }),
  onDownload: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default InvoiceCard;