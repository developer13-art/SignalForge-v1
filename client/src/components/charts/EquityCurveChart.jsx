import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import AreaChart from './AreaChart';
import LineChart from './LineChart';

const EquityCurveChart = forwardRef(function EquityCurveChart(
  {
    data = [],
    xKey = 'date',
    dataKey = 'equity',
    baselineKey,
    height = 320,
    color = '#4f46e5',
    baselineColor = '#94a3b8',
    showBaseline = false,
    variant = 'area',
    valueFormatter,
    xAxisFormatter,
    showGrid = true,
    showLegend = false,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const areas = [
    {
      dataKey,
      name: 'Equity',
      color,
    },
  ];

  const lines = [
    {
      dataKey,
      name: 'Equity',
      color,
    },
  ];

  if (showBaseline && baselineKey) {
    lines.push({
      dataKey: baselineKey,
      name: 'Baseline',
      color: baselineColor,
      dashed: true,
      strokeWidth: 1.5,
    });

    areas.push({
      dataKey: baselineKey,
      name: 'Baseline',
      color: baselineColor,
      fillOpacity: 0.05,
    });
  }

  if (variant === 'line') {
    return (
      <LineChart
        ref={ref}
        data={data}
        lines={lines}
        xKey={xKey}
        height={height}
        colors={[color]}
        showGrid={showGrid}
        showLegend={showLegend}
        tooltipFormatter={valueFormatter}
        xAxisFormatter={xAxisFormatter}
        yAxisFormatter={valueFormatter}
        className={className}
        testId={testId}
        {...rest}
      />
    );
  }

  return (
    <AreaChart
      ref={ref}
      data={data}
      areas={areas}
      xKey={xKey}
      height={height}
      colors={[color, baselineColor]}
      showGrid={showGrid}
      showLegend={showLegend}
      tooltipFormatter={valueFormatter}
      xAxisFormatter={xAxisFormatter}
      yAxisFormatter={valueFormatter}
      className={className}
      testId={testId}
      {...rest}
    />
  );
});

EquityCurveChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  xKey: PropTypes.string,
  dataKey: PropTypes.string,
  baselineKey: PropTypes.string,
  height: PropTypes.number,
  color: PropTypes.string,
  baselineColor: PropTypes.string,
  showBaseline: PropTypes.bool,
  variant: PropTypes.oneOf(['area', 'line']),
  valueFormatter: PropTypes.func,
  xAxisFormatter: PropTypes.func,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default EquityCurveChart;