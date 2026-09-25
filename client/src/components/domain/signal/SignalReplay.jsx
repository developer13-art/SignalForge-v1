import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import SignalTimeline from './SignalTimeline';

const SPEEDS = [0.5, 1, 2, 4];

const SignalReplay = forwardRef(function SignalReplay(
  {
    events = [],
    autoPlay = false,
    showControls = true,
    defaultSpeed = 1,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(defaultSpeed);

  useEffect(() => {
    if (!playing || events.length === 0) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev >= events.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200 / speed);

    return () => clearTimeout(timer);
  }, [playing, currentIndex, events.length, speed]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setPlaying(false);
  }, []);

  const jumpToStart = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const jumpToEnd = useCallback(() => {
    setCurrentIndex(events.length - 1);
  }, [events.length]);

  const visibleEvents = events.slice(0, currentIndex + 1);

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Signal Replay
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Step through the signal processing timeline
          </p>
        </div>

        {showControls ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={jumpToStart} aria-label="Jump to start">
              <SkipBack size={14} aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setPlaying((prev) => !prev)}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={jumpToEnd} aria-label="Jump to end">
              <SkipForward size={14} aria-hidden="true" />
            </Button>
            <Button size="sm" variant="ghost" onClick={reset} aria-label="Reset">
              <RotateCcw size={14} aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </div>

      {showControls ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={[
                  'rounded px-2 py-1 text-xs font-medium transition-colors',
                  speed === s
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-100',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {s}x
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Step {currentIndex + 1} of {events.length}
          </p>
        </div>
      ) : null}

      <div className="mt-4 border-t border-slate-200 pt-4">
        <SignalTimeline events={visibleEvents} />
      </div>
    </Card>
  );
});

SignalReplay.propTypes = {
  events: PropTypes.array.isRequired,
  autoPlay: PropTypes.bool,
  showControls: PropTypes.bool,
  defaultSpeed: PropTypes.number,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SignalReplay;
export { SPEEDS as SIGNAL_REPLAY_SPEEDS };