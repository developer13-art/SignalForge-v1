import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  defs as Defs,
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

const AreaChart = forwardRef(function AreaChart(
  {
    data = [],
    areas = [],
    xKey = 'name',
    height = 300,
    colors = DEFAULT_COLORS,
    showGrid = true,
    showLegend = true,
    showXAxis = true,
    showYAxis = true,
    curved = true,
    strokeWidth = 2,
    fillOpacity = 0.25,
    stacked = false,
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
  const resolvedAreas = useMemo(() => {
    if (!areas || areas.length === 0) {
      return [];
    }
    return areas.map((area, index) => ({
      dataKey: area.dataKey,
      name: area.name || area.dataKey,
      color: area.color || colors[index % colors.length],
      strokeWidth: area.strokeWidth || strokeWidth,
      curved: area.curved !== undefined ? area.curved : curved,
      fillOpacity: area.fillOpacity !== undefined ? area.fillOpacity : fillOpacity,
      stacked: area.stacked !== undefined ? area.stacked : stacked,
    }));
  }, [areas, colors, strokeWidth, curved, fillOpacity, stacked]);

  const gradientIdPrefix = useMemo(
    () => `area-gradient-${Math.random().toString(36).slice(2, 9)}`,
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
            {resolvedAreas.map((area) => (
              <linearGradient
                key={area.dataKey}
                id={`${gradientIdPrefix}-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={area.color} stopOpacity={area.fillOpacity + 0.35} />
                <stop offset="100%" stopColor={area.color} stopOpacity={area.fillOpacity * 0.15} />
              </linearGradient>
            ))}
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
              tickFormatter={yAxisFormatter}
              width={48}
            />
          ) : null}

          <Tooltip
            content={<ChartTooltip variant={tooltipVariant} valueFormatter={tooltipFormatter} />}
            cursor={{ stroke: gridStroke, strokeWidth: 1 }}
          />

          {showLegend && resolvedAreas.length > 1 ? (
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
          ) : null}

          {resolvedAreas.map((area) => (
            <Area
              key={area.dataKey}
              type={area.curved ? 'monotone' : 'linear'}
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              strokeWidth={area.strokeWidth}
              fill={`url(#${gradientIdPrefix}-${area.dataKey})`}
              stackId={area.stacked ? 'stack' : undefined}
              isAnimationActive
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
});

AreaChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
      strokeWidth: PropTypes.number,
      curved: PropTypes.bool,
      fillOpacity: PropTypes.number,
      stacked: PropTypes.bool,
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
  fillOpacity: PropTypes.number,
  stacked: PropTypes.bool,
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

export default AreaChart;
export { DEFAULT_COLORS as AREA_CHART_DEFAULT_COLORS };