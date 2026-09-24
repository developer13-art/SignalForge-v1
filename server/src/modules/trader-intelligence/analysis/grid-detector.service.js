/**
 * Grid Detector Service
 *
 * @module signalforge/server/modules/trader-intelligence/analysis/grid-detector
 */

import { GRID_THRESHOLDS } from '../intelligence.constants.js';

export class GridDetectorService {
  calculate(trades) {
    if (!Array.isArray(trades) || trades.length < GRID_THRESHOLDS.minTrades) {
      return { score: 0, detected: false, samples: trades?.length || 0 };
    }

    const sorted = [...trades].sort(
      (a, b) =>
        new Date(a.opened_at || 0).getTime() - new Date(b.opened_at || 0).getTime(),
    );

    let concurrentWindows = 0;
    let gridWindows = 0;

    const windows = new Map();

    for (const trade of sorted) {
      const opened = new Date(trade.opened_at || 0).getTime();
      const closed = new Date(trade.closed_at || opened).getTime();
      const symbol = trade.normalized_symbol || trade.symbol;

      const windowKey = `${Math.floor(opened / (15 * 60 * 1000))}:${symbol}`;
      if (!windows.has(windowKey)) {
        windows.set(windowKey, []);
      }
      windows.get(windowKey).push({ opened, closed, symbol, direction: trade.direction });

      for (const [key, entries] of windows.entries()) {
        if (entries.length < GRID_THRESHOLDS.minConcurrentTrades) {
          continue;
        }
        const uniqueSymbols = new Set(entries.map((e) => e.symbol));
        const sameDirection = new Set(entries.map((e) => e.direction));

        if (uniqueSymbols.size <= GRID_THRESHOLDS.maxSymbolVariety && sameDirection.size === 1) {
          gridWindows++;
        }
        windows.delete(key);
      }
    }

    const score = Math.min(1, gridWindows / 5);

    return {
      score: Number(score.toFixed(4)),
      detected: gridWindows >= 2,
      windows: gridWindows,
      samples: trades.length,
    };
  }
}

export default GridDetectorService;