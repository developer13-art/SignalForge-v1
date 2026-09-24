import React, { forwardRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_COLORS = ['#e0e7ff', '#a5b4fc', '#6366f1', '#4338ca'];

function interpolateColor(value, min, max, colors) {
  if (max === min) {
    return colors[colors.length - 1];
  }
  const ratio = (value - min) / (max - min);
  const index = Math.min(colors.length - 1, Math.floor(ratio * colors.length));
  return colors[index];
}

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
  if (Math.abs(value) < 1) {
    return value.toFixed(4);
  }
  return value.toFixed(2);
}

const HeatmapChart = forwardRef(function HeatmapChart(
  {
    data = [],
    xKey = 'x',
    yKey = 'y',
    valueKey = 'value',
    colors = DEFAULT_COLORS,
    cellSize = 40,
    cellGap = 2,
    borderRadius = 4,
    showXLabels = true,
    showYLabels = true,
    showLegend = true,
    valueFormatter,
    onCellClick,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const { xLabels, yLabels, cellMap, min, max } = useMemo(() => {
    const xSet = new Set();
    const ySet = new Set();
    const map = new Map();
    let minVal = Infinity;
    let maxVal = -Infinity;

    data.forEach((entry) => {
      const x = entry[xKey];
      const y = entry[yKey];
      const v = Number(entry[valueKey]);

      xSet.add(x);
      ySet.add(y);
      map.set(`${x}|${y}`, v);

      if (Number.isFinite(v)) {
        if (v < minVal) {
          minVal = v;
        }
        if (v > maxVal) {
          maxVal = v;
        }
      }
    });

    return {
      xLabels: Array.from(xSet),
      yLabels: Array.from(ySet),
      cellMap: map,
      min: Number.isFinite(minVal) ? minVal : 0,
      max: Number.isFinite(maxVal) ? maxVal : 1,
    };
  }, [data, xKey, yKey, valueKey]);

  const gridWidth = xLabels.length * (cellSize + cellGap) - cellGap;
  const gridHeight = yLabels.length * (cellSize + cellGap) - cellGap;

  const labelOffsetX = showYLabels ? 60 : 0;
  const labelOffsetY = showXLabels ? 24 : 0;

  const svgWidth = gridWidth + labelOffsetX + 8;
  const svgHeight = gridHeight + labelOffsetY + 8;

  const hovered = hoveredCell ? cellMap.get(hoveredCell) : undefined;

  return (
    <div
      ref={ref}
      className={['inline-block w-full overflow-auto', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label="Heatmap chart"
      >
        {showXLabels
          ? xLabels.map((x, xi) => (
              <text
                key={`xlabel-${x}`}
                x={labelOffsetX + xi * (cellSize + cellGap) + cellSize / 2}
                y={16}
                textAnchor="middle"
                fontSize={10}
                fill="#64748b"
              >
                {x}
              </text>
            ))
          : null}

        {showYLabels
          ? yLabels.map((y, yi) => (
              <text
                key={`ylabel-${y}`}
                x={labelOffsetX - 8}
                y={labelOffsetY + yi * (cellSize + cellGap) + cellSize / 2 + 4}
                textAnchor="end"
                fontSize={10}
                fill="#64748b"
              >
                {y}
              </text>
            ))
          : null}

        {yLabels.map((y, yi) =>
          xLabels.map((x, xi) => {
            const value = cellMap.get(`${x}|${y}`);
            const hasValue = value !== undefined && Number.isFinite(value);
            const fill = hasValue ? interpolateColor(value, min, max, colors) : '#f1f5f9';
            const cx = labelOffsetX + xi * (cellSize + cellGap);
            const cy = labelOffsetY + yi * (cellSize + cellGap);
            const cellKey = `${x}|${y}`;
            const isHovered = hoveredCell === cellKey;

            return (
              <g key={`cell-${cellKey}`}>
                <rect
                  x={cx}
                  y={cy}
                  width={cellSize}
                  height={cellSize}
                  rx={borderRadius}
                  ry={borderRadius}
                  fill={fill}
                  stroke={isHovered ? '#1e293b' : 'transparent'}
                  strokeWidth={isHovered ? 2 : 0}
                  onMouseEnter={() => setHoveredCell(cellKey)}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={
                    onCellClick
                      ? () => onCellClick({ x, y, value, raw: { [xKey]: x, [yKey]: y, [valueKey]: value } })
                      : undefined
                  }
                  style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                />
                {hasValue && cellSize >= 32 ? (
                  <text
                    x={cx + cellSize / 2}
                    y={cy + cellSize / 2 + 3}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#0f172a"
                    fontWeight={600}
                    pointerEvents="none"
                  >
                    {formatValue(value, valueFormatter)}
                  </text>
                ) : null}
              </g>
            );
          }),
        )}
      </svg>

      {hoveredCell ? (
        <div className="pointer-events-none fixed z-[9999] rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
          <div className="font-medium text-slate-700">{hoveredCell.replace('|', ' / ')}</div>
          <div className="text-slate-500">
            {hovered !== undefined ? formatValue(hovered, valueFormatter) : '—'}
          </div>
        </div>
      ) : null}

      {showLegend ? (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[11px] text-slate-500">{formatValue(min, valueFormatter)}</span>
          <div className="flex h-3 overflow-hidden rounded">
            {colors.map((c) => (
              <div
                key={c}
                className="h-full w-6"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-500">{formatValue(max, valueFormatter)}</span>
        </div>
      ) : null}
    </div>
  );
});

HeatmapChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  xKey: PropTypes.string,
  yKey: PropTypes.string,
  valueKey: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  cellSize: PropTypes.number,
  cellGap: PropTypes.number,
  borderRadius: PropTypes.number,
  showXLabels: PropTypes.bool,
  showYLabels: PropTypes.bool,
  showLegend: PropTypes.bool,
  valueFormatter: PropTypes.func,
  onCellClick: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default HeatmapChart;
export { DEFAULT_COLORS as HEATMAP_CHART_DEFAULT_COLORS };