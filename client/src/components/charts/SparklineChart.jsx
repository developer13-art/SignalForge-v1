import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

const SparklineChart = forwardRef(function SparklineChart(
  {
    data = [],
    dataKey,
    width = 120,
    height = 32,
    color = '#4f46e5',
    fillColor,
    strokeWidth = 1.5,
    variant = 'line',
    showLastDot = false,
    min,
    max,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const values = useMemo(() => {
    if (data.length === 0) {
      return [];
    }
    if (dataKey) {
      return data.map((d) => Number(d[dataKey]));
    }
    if (typeof data[0] === 'number') {
      return data.map((v) => Number(v));
    }
    return [];
  }, [data, dataKey]);

  const computedMin = useMemo(() => {
    if (min !== undefined) {
      return min;
    }
    if (values.length === 0) {
      return 0;
    }
    return Math.min(...values);
  }, [values, min]);

  const computedMax = useMemo(() => {
    if (max !== undefined) {
      return max;
    }
    if (values.length === 0) {
      return 1;
    }
    return Math.max(...values);
  }, [values, max]);

  const gradientId = useMemo(
    () => `sparkline-gradient-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  const { path, areaPath, lastPoint } = useMemo(() => {
    if (values.length < 2) {
      return { path: '', areaPath: '', lastPoint: null };
    }

    const range = computedMax - computedMin || 1;
    const stepX = width / (values.length - 1);

    const points = values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - computedMin) / range) * height;
      return { x, y };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(' ');

    const area = `${linePath} L${width},${height} L0,${height} Z`;

    return {
      path: linePath,
      areaPath: area,
      lastPoint: points[points.length - 1],
    };
  }, [values, computedMin, computedMax, width, height]);

  if (values.length < 2) {
    return (
      <div
        ref={ref}
        className={['inline-flex items-center text-[10px] text-slate-400', className]
          .filter(Boolean)
          .join(' ')}
        style={{ width, height }}
        data-testid={testId}
        {...rest}
      >
        —
      </div>
    );
  }

  const isPositive = values[values.length - 1] >= values[0];
  const resolvedColor = isPositive ? color : '#e11d48';
  const resolvedFill = fillColor || `${resolvedColor}20`;

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={['overflow-visible', className].filter(Boolean).join(' ')}
      role="img"
      aria-label="Sparkline"
      data-testid={testId}
      {...rest}
    >
      {variant === 'area' ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={resolvedColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={resolvedColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
        </>
      ) : null}

      <path
        d={path}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {showLastDot && lastPoint ? (
        <circle cx={lastPoint.x} cy={lastPoint.y} r={2.5} fill={resolvedColor} />
      ) : null}
    </svg>
  );
});

SparklineChart.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.arrayOf(PropTypes.object),
  ]),
  dataKey: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  fillColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  variant: PropTypes.oneOf(['line', 'area']),
  showLastDot: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SparklineChart;