import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_COLORS = {
  bullish: '#10b981',
  bearish: '#e11d48',
  wick: '#64748b',
  grid: '#e2e8f0',
  axis: '#94a3b8',
  text: '#64748b',
};

const PADDING = { top: 16, right: 16, bottom: 28, left: 56 };

function formatValue(value, formatter) {
  if (formatter) {
    return formatter(value);
  }
  if (typeof value !== 'number') {
    return value;
  }
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value.toFixed(Math.abs(value) < 1 ? 5 : 2);
}

const CandlestickChart = forwardRef(function CandlestickChart(
  {
    data = [],
    height = 360,
    width,
    colors = DEFAULT_COLORS,
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    valueFormatter,
    xAxisFormatter,
    yAxisKey = 'close',
    xAxisKey = 'time',
    candleWidthRatio = 0.6,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const dimensions = useMemo(() => {
    const viewWidth = width || 900;
    const viewHeight = height;
    const innerWidth = viewWidth - PADDING.left - PADDING.right;
    const innerHeight = viewHeight - PADDING.top - PADDING.bottom;
    return { viewWidth, viewHeight, innerWidth, innerHeight };
  }, [width, height]);

  const { viewWidth, viewHeight, innerWidth, innerHeight } = dimensions;

  const { min, max, priceToY } = useMemo(() => {
    if (data.length === 0) {
      return { min: 0, max: 0, priceToY: () => PADDING.top + innerHeight / 2 };
    }
    const highs = data.map((d) => Number(d.high ?? d.close));
    const lows = data.map((d) => Number(d.low ?? d.close));
    const rawMin = Math.min(...lows);
    const rawMax = Math.max(...highs);
    const range = rawMax - rawMin || 1;
    const padding = range * 0.05;
    const minVal = rawMin - padding;
    const maxVal = rawMax + padding;

    const priceToYFn = (value) =>
      PADDING.top + innerHeight - ((Number(value) - minVal) / (maxVal - minVal)) * innerHeight;

    return { min: minVal, max: maxVal, priceToY: priceToYFn };
  }, [data, innerHeight]);

  const candleSlotWidth = data.length > 0 ? innerWidth / data.length : 0;
  const candleWidth = Math.max(2, candleSlotWidth * candleWidthRatio);

  const xToCenter = (index) => PADDING.left + index * candleSlotWidth + candleSlotWidth / 2;

  const yTicks = useMemo(() => {
    if (data.length === 0) {
      return [];
    }
    const tickCount = 5;
    const step = (max - min) / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) => min + step * i);
  }, [min, max, data.length]);

  const xTicks = useMemo(() => {
    if (data.length === 0) {
      return [];
    }
    const desiredTicks = Math.min(6, data.length);
    const step = Math.ceil(data.length / desiredTicks);
    const ticks = [];
    for (let i = 0; i < data.length; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [data]);

  if (data.length === 0) {
    return (
      <div
        ref={ref}
        className={['flex items-center justify-center rounded-md border border-slate-200 bg-white', className]
          .filter(Boolean)
          .join(' ')}
        style={{ height }}
        data-testid={testId}
        {...rest}
      >
        <span className="text-sm text-slate-400">No candlestick data available</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={['w-full overflow-hidden rounded-md border border-slate-200 bg-white', className]
        .filter(Boolean)
        .join(' ')}
      style={{ height }}
      data-testid={testId}
      {...rest}
    >
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        role="img"
        aria-label="Candlestick chart"
      >
        {showGrid
          ? yTicks.map((tick, index) => {
              const y = priceToY(tick);
              return (
                <line
                  key={`grid-${index}`}
                  x1={PADDING.left}
                  y1={y}
                  x2={viewWidth - PADDING.right}
                  y2={y}
                  stroke={colors.grid}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              );
            })
          : null}

        {showYAxis
          ? yTicks.map((tick, index) => {
              const y = priceToY(tick);
              return (
                <text
                  key={`ytick-${index}`}
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill={colors.text}
                >
                  {formatValue(tick, valueFormatter)}
                </text>
              );
            })
          : null}

        {data.map((candle, index) => {
          const open = Number(candle.open ?? candle.close);
          const close = Number(candle.close);
          const high = Number(candle.high ?? Math.max(open, close));
          const low = Number(candle.low ?? Math.min(open, close));
          const isBullish = close >= open;
          const color = isBullish ? colors.bullish : colors.bearish;

          const cx = xToCenter(index);
          const yHigh = priceToY(high);
          const yLow = priceToY(low);
          const yOpen = priceToY(open);
          const yClose = priceToY(close);
          const bodyTop = Math.min(yOpen, yClose);
          const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));

          return (
            <g key={`candle-${index}`}>
              <line
                x1={cx}
                y1={yHigh}
                x2={cx}
                y2={yLow}
                stroke={color}
                strokeWidth={1}
              />
              <rect
                x={cx - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={color}
                stroke={color}
                strokeWidth={0.5}
              />
            </g>
          );
        })}

        {showXAxis
          ? xTicks.map((index) => {
              const cx = xToCenter(index);
              const label = data[index]?.[xAxisKey];
              return (
                <text
                  key={`xtick-${index}`}
                  x={cx}
                  y={viewHeight - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill={colors.text}
                >
                  {xAxisFormatter ? xAxisFormatter(label, data[index]) : label}
                </text>
              );
            })
          : null}
      </svg>
    </div>
  );
});

CandlestickChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      open: PropTypes.number,
      high: PropTypes.number,
      low: PropTypes.number,
      close: PropTypes.number.isRequired,
    }),
  ),
  height: PropTypes.number,
  width: PropTypes.number,
  colors: PropTypes.shape({
    bullish: PropTypes.string,
    bearish: PropTypes.string,
    wick: PropTypes.string,
    grid: PropTypes.string,
    axis: PropTypes.string,
    text: PropTypes.string,
  }),
  showGrid: PropTypes.bool,
  showXAxis: PropTypes.bool,
  showYAxis: PropTypes.bool,
  valueFormatter: PropTypes.func,
  xAxisFormatter: PropTypes.func,
  yAxisKey: PropTypes.string,
  xAxisKey: PropTypes.string,
  candleWidthRatio: PropTypes.number,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default CandlestickChart;
export { DEFAULT_COLORS as CANDLESTICK_CHART_DEFAULT_COLORS };