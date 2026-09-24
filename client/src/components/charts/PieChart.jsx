import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts';
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
  '#6366f1',
  '#0d9488',
];

const PieChart = forwardRef(function PieChart(
  {
    data = [],
    dataKey = 'value',
    nameKey = 'name',
    height = 300,
    colors = DEFAULT_COLORS,
    innerRadius = 0,
    outerRadius = '80%',
    paddingAngle = 0,
    startAngle = 90,
    endAngle = -270,
    showLegend = true,
    showLabels = false,
    labelFormatter,
    tooltipFormatter,
    tooltipVariant = 'default',
    legendPosition = 'right',
    cornerRadius = 0,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const total = useMemo(
    () => data.reduce((sum, entry) => sum + Number(entry[dataKey] || 0), 0),
    [data, dataKey],
  );

  const renderLabel = (entry) => {
    if (!showLabels) {
      return null;
    }
    const percent = total === 0 ? 0 : (Number(entry[dataKey]) / total) * 100;
    return labelFormatter ? labelFormatter(entry, percent) : `${percent.toFixed(1)}%`;
  };

  return (
    <div
      ref={ref}
      className={['w-full', className].filter(Boolean).join(' ')}
      style={{ height }}
      data-testid={testId}
      {...rest}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            startAngle={startAngle}
            endAngle={endAngle}
            label={showLabels ? renderLabel : false}
            labelLine={showLabels ? { stroke: '#cbd5e1', strokeWidth: 1 } : false}
            isAnimationActive
            cornerRadius={cornerRadius}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry[nameKey] || index}`}
                fill={colors[index % colors.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip
            content={<ChartTooltip variant={tooltipVariant} valueFormatter={tooltipFormatter} />}
          />

          {showLegend ? (
            <Legend
              layout={legendPosition === 'bottom' ? 'horizontal' : 'vertical'}
              align={legendPosition === 'bottom' ? 'center' : legendPosition === 'left' ? 'left' : 'right'}
              verticalAlign={legendPosition === 'bottom' ? 'bottom' : 'middle'}
              wrapperStyle={{ fontSize: 12, paddingLeft: legendPosition === 'right' ? 12 : 0, paddingRight: legendPosition === 'left' ? 12 : 0 }}
              iconType="circle"
              iconSize={8}
            />
          ) : null}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
});

PieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  dataKey: PropTypes.string,
  nameKey: PropTypes.string,
  height: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string),
  innerRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  outerRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  paddingAngle: PropTypes.number,
  startAngle: PropTypes.number,
  endAngle: PropTypes.number,
  showLegend: PropTypes.bool,
  showLabels: PropTypes.bool,
  labelFormatter: PropTypes.func,
  tooltipFormatter: PropTypes.func,
  tooltipVariant: PropTypes.string,
  legendPosition: PropTypes.oneOf(['left', 'right', 'bottom']),
  cornerRadius: PropTypes.number,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PieChart;
export { DEFAULT_COLORS as PIE_CHART_DEFAULT_COLORS };