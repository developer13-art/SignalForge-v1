import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartTooltip from './ChartTooltip';

const DEFAULT_COLORS = [
  '#4f46e5',
  '#10b981',
  '#f59e0b',
  '#e11d48',
  '#0ea5e9',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
];

const LineChart = forwardRef(function LineChart(
  {
    data = [],
    lines = [],
    xKey = 'name',
    height = 300,
    colors = DEFAULT_COLORS,
    showGrid = true,
    showLegend = true,
    showXAxis = true,
    showYAxis = true,
    curved = true,
    strokeWidth = 2,
    dot = false,
    activeDot = true,
    gridStroke = '#e2e8f0',
    axisStroke = '#94a3b8',
    axisFontSize = 12,
    tooltipFormatter,
    yAxisFormatter,
    xAxisFormatter,
    tooltipVariant = 'default',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const resolvedLines = useMemo(() => {
    if (lines && lines.length > 0) {
      return lines.map((line, index) => ({
        dataKey: line.dataKey,
        name: line.name || line.dataKey,
        color: line.color || colors[index % colors.length],
        strokeWidth: line.strokeWidth || strokeWidth,
        curved: line.curved !== undefined ? line.curved : curved,
        dot: line.dot !== undefined ? line.dot : dot,
        dashed: line.dashed || false,
      }));
    }
    return [];
  }, [lines, colors, strokeWidth, curved, dot]);

  return (
    <div
      ref={ref}
      className={['w-full', className].filter(Boolean).join(' ')}
      style={{ height }}
      data-testid={testId}
      {...rest}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
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
              tickFormatter={yAxisFormatter}
              width={48}
            />
          ) : null}

          <Tooltip
            content={<ChartTooltip variant={tooltipVariant} valueFormatter={tooltipFormatter} />}
            cursor={{ stroke: gridStroke, strokeWidth: 1 }}
          />

          {showLegend && resolvedLines.length > 1 ? (
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
          ) : null}

          {resolvedLines.map((line) => (
            <Line
              key={line.dataKey}
              type={line.curved ? 'monotone' : 'linear'}
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              strokeDasharray={line.dashed ? '5 5' : undefined}
              dot={line.dot ? { r: 3 } : false}
              activeDot={activeDot ? { r: 5 } : false}
              isAnimationActive
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
});

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  lines: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
      strokeWidth: PropTypes.number,
      curved: PropTypes.bool,
      dot: PropTypes.bool,
      dashed: PropTypes.bool,
    }),
  ).isRequired,
  xKey: PropTypes.string,
  height: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string),
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  showXAxis: PropTypes.bool,
  showYAxis: PropTypes.bool,
  curved: PropTypes.bool,
  strokeWidth: PropTypes.number,
  dot: PropTypes.bool,
  activeDot: PropTypes.bool,
  gridStroke: PropTypes.string,
  axisStroke: PropTypes.string,
  axisFontSize: PropTypes.number,
  tooltipFormatter: PropTypes.func,
  yAxisFormatter: PropTypes.func,
  xAxisFormatter: PropTypes.func,
  tooltipVariant: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default LineChart;
export { DEFAULT_COLORS as LINE_CHART_DEFAULT_COLORS };