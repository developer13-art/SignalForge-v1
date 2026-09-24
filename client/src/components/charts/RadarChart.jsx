import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import ChartTooltip from './ChartTooltip';

const DEFAULT_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#e11d48', '#0ea5e9'];

const RadarChart = forwardRef(function RadarChart(
  {
    data = [],
    series = [],
    angleKey = 'subject',
    height = 320,
    colors = DEFAULT_COLORS,
    showGrid = true,
    showAngles = true,
    showRadiusAxis = true,
    fillOpacity = 0.25,
    strokeWidth = 2,
    outerRadius = '80%',
    tooltipFormatter,
    tooltipVariant = 'default',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const resolvedSeries = useMemo(() => {
    if (!series || series.length === 0) {
      return [];
    }
    return series.map((item, index) => ({
      dataKey: item.dataKey,
      name: item.name || item.dataKey,
      color: item.color || colors[index % colors.length],
      fillOpacity: item.fillOpacity !== undefined ? item.fillOpacity : fillOpacity,
      strokeWidth: item.strokeWidth || strokeWidth,
    }));
  }, [series, colors, fillOpacity, strokeWidth]);

  return (
    <div
      ref={ref}
      className={['w-full', className].filter(Boolean).join(' ')}
      style={{ height }}
      data-testid={testId}
      {...rest}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} outerRadius={outerRadius}>
          {showGrid ? <PolarGrid stroke="#e2e8f0" /> : null}
          {showAngles ? (
            <PolarAngleAxis dataKey={angleKey} tick={{ fontSize: 11, fill: '#64748b' }} />
          ) : null}
          {showRadiusAxis ? (
            <PolarRadiusAxis angle={90} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          ) : null}

          <Tooltip
            content={<ChartTooltip variant={tooltipVariant} valueFormatter={tooltipFormatter} />}
          />

          {resolvedSeries.map((item) => (
            <Radar
              key={item.dataKey}
              dataKey={item.dataKey}
              name={item.name}
              stroke={item.color}
              strokeWidth={item.strokeWidth}
              fill={item.color}
              fillOpacity={item.fillOpacity}
              isAnimationActive
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
});

RadarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  series: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
      fillOpacity: PropTypes.number,
      strokeWidth: PropTypes.number,
    }),
  ).isRequired,
  angleKey: PropTypes.string,
  height: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string),
  showGrid: PropTypes.bool,
  showAngles: PropTypes.bool,
  showRadiusAxis: PropTypes.bool,
  fillOpacity: PropTypes.number,
  strokeWidth: PropTypes.number,
  outerRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tooltipFormatter: PropTypes.func,
  tooltipVariant: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default RadarChart;
export { DEFAULT_COLORS as RADAR_CHART_DEFAULT_COLORS };