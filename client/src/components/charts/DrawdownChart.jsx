import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartTooltip from './ChartTooltip';

const DrawdownChart = forwardRef(function DrawdownChart(
  {
    data = [],
    xKey = 'date',
    dataKey = 'drawdown',
    height = 280,
    color = '#e11d48',
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    showThresholdLine = false,
    threshold = -10,
    thresholdColor = '#f59e0b',
    thresholdLabel = 'Threshold',
    gridStroke = '#e2e8f0',
    axisStroke = '#94a3b8',
    axisFontSize = 12,
    valueFormatter,
    xAxisFormatter,
    tooltipVariant = 'default',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const gradientId = useMemo(
    () => `drawdown-gradient-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  return (
    <div
      ref={ref}
      className={['w-full', className].filter(Boolean).join(' ')}
      style={{ height }}
      data-testid={testId}
      {...rest}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {showGrid ? (
            <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" vertical={false} />
          ) : null}

          {showXAxis ? (
            <XAxis
              dataKey={xKey}
              stroke={axisStroke}
              fontSize={axisFontSize}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              tickFormatter={xAxisFormatter}
            />
          ) : null}

          {showYAxis ? (
            <YAxis
              stroke={axisStroke}
              fontSize={axisFontSize}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              tickFormatter={valueFormatter}
              width={48}
            />
          ) : null}

          {showThresholdLine ? (
            <ReferenceLine
              y={threshold}
              stroke={thresholdColor}
              strokeDasharray="4 4"
              label={{
                value: thresholdLabel,
                position: 'right',
                fill: thresholdColor,
                fontSize: 11,
              }}
            />
          ) : null}

          <Tooltip
            content={<ChartTooltip variant={tooltipVariant} valueFormatter={valueFormatter} />}
            cursor={{ stroke: gridStroke, strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
});

DrawdownChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  xKey: PropTypes.string,
  dataKey: PropTypes.string,
  height: PropTypes.number,
  color: PropTypes.string,
  showGrid: PropTypes.bool,
  showXAxis: PropTypes.bool,
  showYAxis: PropTypes.bool,
  showThresholdLine: PropTypes.bool,
  threshold: PropTypes.number,
  thresholdColor: PropTypes.string,
  thresholdLabel: PropTypes.string,
  gridStroke: PropTypes.string,
  axisStroke: PropTypes.string,
  axisFontSize: PropTypes.number,
  valueFormatter: PropTypes.func,
  xAxisFormatter: PropTypes.func,
  tooltipVariant: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default DrawdownChart;