import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
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

const BarChart = forwardRef(function BarChart(
  {
    data = [],
    bars = [],
    xKey = 'name',
    height = 300,
    colors = DEFAULT_COLORS,
    showGrid = true,
    showLegend = true,
    showXAxis = true,
    showYAxis = true,
    stacked = false,
    horizontal = false,
    barSize,
    radius = [6, 6, 0, 0],
    gridStroke = '#e2e8f0',
    axisStroke = '#94a3b8',
    axisFontSize = 12,
    tooltipFormatter,
    yAxisFormatter,
    xAxisFormatter,
    tooltipVariant = 'default',
    perCellColors = false,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const resolvedBars = useMemo(() => {
    if (!bars || bars.length === 0) {
      return [];
    }
    return bars.map((bar, index) => ({
      dataKey: bar.dataKey,
      name: bar.name || bar.dataKey,
      color: bar.color || colors[index % colors.length],
      stacked: bar.stacked !== undefined ? bar.stacked : stacked,
      radius: bar.radius || radius,
    }));
  }, [bars, colors, stacked, radius]);

  const layout = horizontal ? 'vertical' : 'horizontal';
  const categoryAxis = horizontal ? 'YAxis' : 'XAxis';
  const valueAxis = horizontal ? 'XAxis' : 'YAxis';

  const renderCategoryAxis = (Component) => (
    <Component
      dataKey={xKey}
      type="category"
      stroke={axisStroke}
      fontSize={axisFontSize}
      tickLine={false}
      axisLine={{ stroke: gridStroke }}
      tickFormatter={xAxisFormatter}
      width={horizontal ? 90 : undefined}
    />
  );

  const renderValueAxis = (Component) => (
    <Component
      type="number"
      stroke={axisStroke}
      fontSize={axisFontSize}
      tickLine={false}
      axisLine={{ stroke: gridStroke }}
      tickFormatter={yAxisFormatter}
      width={horizontal ? undefined : 48}
    />
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
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
          barCategoryGap={barSize ? undefined : '20%'}
        >
          {showGrid ? (
            <CartesianGrid
              stroke={gridStroke}
              strokeDasharray="4 4"
              horizontal={!horizontal}
              vertical={horizontal}
            />
          ) : null}

          {showXAxis
            ? horizontal
              ? renderValueAxis(XAxis)
              : renderCategoryAxis(XAxis)
            : null}

          {showYAxis
            ? horizontal
              ? renderCategoryAxis(YAxis)
              : renderValueAxis(YAxis)
            : null}

          <Tooltip
            content={<ChartTooltip variant={tooltipVariant} valueFormatter={tooltipFormatter} />}
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
          />

          {showLegend && resolvedBars.length > 1 ? (
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
          ) : null}

          {resolvedBars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={bar.stacked ? 'stack' : undefined}
              radius={bar.radius}
              barSize={barSize}
              isAnimationActive
            >
              {perCellColors && data.length > 0
                ? data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))
                : null}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
});

BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  bars: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
      stacked: PropTypes.bool,
      radius: PropTypes.arrayOf(PropTypes.number),
    }),
  ).isRequired,
  xKey: PropTypes.string,
  height: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string),
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  showXAxis: PropTypes.bool,
  showYAxis: PropTypes.bool,
  stacked: PropTypes.bool,
  horizontal: PropTypes.bool,
  barSize: PropTypes.number,
  radius: PropTypes.arrayOf(PropTypes.number),
  gridStroke: PropTypes.string,
  axisStroke: PropTypes.string,
  axisFontSize: PropTypes.number,
  tooltipFormatter: PropTypes.func,
  yAxisFormatter: PropTypes.func,
  xAxisFormatter: PropTypes.func,
  tooltipVariant: PropTypes.string,
  perCellColors: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default BarChart;
export { DEFAULT_COLORS as BAR_CHART_DEFAULT_COLORS };