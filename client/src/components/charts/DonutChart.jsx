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

const DonutChart = forwardRef(function DonutChart(
  {
    data = [],
    dataKey = 'value',
    nameKey = 'name',
    height = 300,
    colors = DEFAULT_COLORS,
    thickness = 20,
    centerLabel,
    centerValue,
    centerSubLabel,
    paddingAngle = 2,
    startAngle = 90,
    endAngle = -270,
    showLegend = true,
    showLabels = false,
    labelFormatter,
    tooltipFormatter,
    tooltipVariant = 'default',
    legendPosition = 'right',
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

  const outerRadius = '85%';
  const innerRadius = useMemo(() => {
    if (typeof thickness === 'number') {
      return `${Math.max(30, 85 - thickness)}%`;
    }
    return '60%';
  }, [thickness]);

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
      className={['relative w-full', className].filter(Boolean).join(' ')}
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
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
              iconSize={8}
            />
          ) : null}
        </RechartsPieChart>
      </ResponsiveContainer>

      {centerLabel || centerValue || centerSubLabel ? (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          style={{
            right: legendPosition === 'right' ? '30%' : legendPosition === 'left' ? '30%' : 0,
            left: legendPosition === 'left' ? '30%' : legendPosition === 'right' ? 0 : 0,
            bottom: legendPosition === 'bottom' ? '15%' : 0,
          }}
        >
          {centerValue !== undefined ? (
            <span className="text-2xl font-bold text-slate-900">{centerValue}</span>
          ) : null}
          {centerLabel ? (
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {centerLabel}
            </span>
          ) : null}
          {centerSubLabel ? (
            <span className="mt-0.5 text-[11px] text-slate-400">{centerSubLabel}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

DonutChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  dataKey: PropTypes.string,
  nameKey: PropTypes.string,
  height: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string),
  thickness: PropTypes.number,
  centerLabel: PropTypes.node,
  centerValue: PropTypes.node,
  centerSubLabel: PropTypes.node,
  paddingAngle: PropTypes.number,
  startAngle: PropTypes.number,
  endAngle: PropTypes.number,
  showLegend: PropTypes.bool,
  showLabels: PropTypes.bool,
  labelFormatter: PropTypes.func,
  tooltipFormatter: PropTypes.func,
  tooltipVariant: PropTypes.string,
  legendPosition: PropTypes.oneOf(['left', 'right', 'bottom']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default DonutChart;
export { DEFAULT_COLORS as DONUT_CHART_DEFAULT_COLORS };