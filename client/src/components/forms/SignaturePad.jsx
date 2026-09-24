import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Eraser, Undo2 } from 'lucide-react';

const SignaturePad = forwardRef(function SignaturePad(
  {
    width = 500,
    height = 200,
    penColor = '#0f172a',
    backgroundColor = '#ffffff',
    lineWidth = 2,
    lineCap = 'round',
    lineJoin = 'round',
    disabled = false,
    placeholder = 'Sign here',
    onChange,
    onEnd,
    className = '',
    canvasClassName = '',
    showActions = true,
    testId,
    ...rest
  },
  ref
) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const pathsRef = useRef([]);
  const currentPathRef = useRef(null);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    ctx.strokeStyle = penColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;
    return ctx;
  }, [penColor, lineWidth, lineCap, lineJoin]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) {
      return;
    }
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pathsRef.current.forEach((path) => {
      if (path.length < 2) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i += 1) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });
  }, [getCtx, backgroundColor]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }
    redraw();
  }, [width, height, redraw]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (event) => {
    if (disabled) {
      return;
    }
    event.preventDefault();
    const point = getPoint(event);
    currentPathRef.current = [point];
    pathsRef.current.push(currentPathRef.current);
    setDrawing(true);
    setIsEmpty(false);
  };

  const handleMove = (event) => {
    if (!drawing || disabled) {
      return;
    }
    event.preventDefault();
    const point = getPoint(event);
    currentPathRef.current.push(point);
    redraw();
  };

  const handleEnd = (event) => {
    if (!drawing) {
      return;
    }
    if (event) {
      event.preventDefault();
    }
    setDrawing(false);
    currentPathRef.current = null;
    if (onChange) {
      onChange(pathsRef.current);
    }
    if (onEnd) {
      onEnd(pathsRef.current);
    }
  };

  const clear = useCallback(() => {
    pathsRef.current = [];
    currentPathRef.current = null;
    setIsEmpty(true);
    redraw();
    if (onChange) {
      onChange([]);
    }
  }, [redraw, onChange]);

  const undo = useCallback(() => {
    if (pathsRef.current.length === 0) {
      return;
    }
    pathsRef.current.pop();
    setIsEmpty(pathsRef.current.length === 0);
    redraw();
    if (onChange) {
      onChange(pathsRef.current);
    }
  }, [redraw, onChange]);

  const toDataURL = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas ? canvas.toDataURL('image/png') : null;
  }, []);

  const toBlob = useCallback(
    (callback, mimeType = 'image/png') => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      if (canvas.toBlob) {
        canvas.toBlob(callback, mimeType);
      }
    },
    []
  );

  useImperativeHandle(
    ref,
    () => ({
      clear,
      undo,
      isEmpty: () => isEmpty,
      toDataURL,
      toBlob,
      getPaths: () => pathsRef.current,
    }),
    [clear, undo, isEmpty, toDataURL, toBlob]
  );

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')} data-testid={testId} {...rest}>
      <div
        className={[
          'relative overflow-hidden rounded-md border-2 border-dashed border-slate-300 bg-white',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair',
          canvasClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ width: '100%', height: `${height}px`, touchAction: 'none' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

        {isEmpty ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-slate-400">{placeholder}</span>
          </div>
        ) : null}
      </div>

      {showActions ? (
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Sign inside the box using your mouse or finger.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={isEmpty || disabled}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Undo2 size={12} aria-hidden="true" />
              Undo
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={isEmpty || disabled}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eraser size={12} aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
});

SignaturePad.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  penColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  lineWidth: PropTypes.number,
  lineCap: PropTypes.oneOf(['butt', 'round', 'square']),
  lineJoin: PropTypes.oneOf(['round', 'bevel', 'miter']),
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onEnd: PropTypes.func,
  className: PropTypes.string,
  canvasClassName: PropTypes.string,
  showActions: PropTypes.bool,
  testId: PropTypes.string,
};

export default SignaturePad;