import React, { forwardRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function getColorForValue(value) {
  if (value === undefined || value === null) {
    return 'bg-slate-50 text-slate-400';
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return 'bg-slate-50 text-slate-400';
  }
  if (num === 0) {
    return 'bg-slate-100 text-slate-500';
  }
  if (num > 0) {
    if (num < 100) {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (num < 500) {
      return 'bg-emerald-300 text-emerald-900';
    }
    return 'bg-emerald-500 text-white';
  }
  if (num > -100) {
    return 'bg-rose-100 text-rose-700';
  }
  if (num > -500) {
    return 'bg-rose-300 text-rose-900';
  }
  return 'bg-rose-500 text-white';
}

const TradingCalendarWidget = forwardRef(function TradingCalendarWidget(
  {
    data = {},
    initialMonth,
    initialYear,
    currency = 'USD',
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    initialMonth !== undefined ? initialMonth : now.getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    initialYear !== undefined ? initialYear : now.getFullYear()
  );

  const monthData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const cells = [];

    for (let i = 0; i < firstDayOfMonth; i += 1) {
      cells.push({ empty: true, key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = formatDateKey(currentYear, currentMonth, day);
      cells.push({
        key: dateKey,
        day,
        dateKey,
        value: data[dateKey],
      });
    }

    return cells;
  }, [currentYear, currentMonth, data]);

  const monthTotals = useMemo(() => {
    let total = 0;
    let wins = 0;
    let losses = 0;

    monthData.forEach((cell) => {
      if (!cell.empty && cell.value !== undefined && cell.value !== null) {
        const num = Number(cell.value);
        if (!Number.isNaN(num)) {
          total += num;
          if (num > 0) {
            wins += 1;
          } else if (num < 0) {
            losses += 1;
          }
        }
      }
    });

    return { total, wins, losses };
  }, [monthData]);

  const goPrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const goNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Trading Calendar
          </h3>
          <p className="mt-1 text-xs text-slate-500">Daily P/L performance</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous month"
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <span className="min-w-[130px] text-center text-sm font-medium text-slate-700">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next month"
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Separator spacing="md" />

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400"
          >
            {day}
          </div>
        ))}

        {monthData.map((cell) => {
          if (cell.empty) {
            return <div key={cell.key} className="aspect-square" />;
          }

          const colorClass = getColorForValue(cell.value);

          return (
            <div
              key={cell.key}
              className={[
                'flex aspect-square flex-col items-center justify-center rounded-md px-1 text-center text-xs font-semibold transition-colors',
                colorClass,
              ]
                .filter(Boolean)
                .join(' ')}
              title={cell.value !== undefined ? `${cell.dateKey}: ${currency} ${cell.value}` : cell.dateKey}
            >
              <span className="text-[10px] font-medium opacity-75">{cell.day}</span>
              {cell.value !== undefined && cell.value !== null ? (
                <span className="mt-0.5 text-[10px] font-bold">
                  {Number(cell.value) > 0 ? '+' : ''}
                  {Number(cell.value) >= 1000 || Number(cell.value) <= -1000
                    ? `${(Number(cell.value) / 1000).toFixed(1)}k`
                    : Math.round(Number(cell.value))}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <Separator spacing="md" />

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Month Net
          </p>
          <p
            className={[
              'mt-1 text-base font-semibold',
              monthTotals.total >= 0 ? 'text-emerald-600' : 'text-rose-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {loading ? '—' : `${currency} ${monthTotals.total.toLocaleString()}`}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Winning Days
          </p>
          <p className="mt-1 text-base font-semibold text-emerald-600">
            {loading ? '—' : monthTotals.wins}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Losing Days
          </p>
          <p className="mt-1 text-base font-semibold text-rose-600">
            {loading ? '—' : monthTotals.losses}
          </p>
        </div>
      </div>
    </Card>
  );
});

TradingCalendarWidget.propTypes = {
  data: PropTypes.object,
  initialMonth: PropTypes.number,
  initialYear: PropTypes.number,
  currency: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradingCalendarWidget;