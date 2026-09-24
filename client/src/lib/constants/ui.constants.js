/**
 * UI Constants
 *
 * @module client/src/lib/constants/ui.constants
 */

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 76;
export const TOPBAR_HEIGHT = 64;
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;
export const DESKTOP_BREAKPOINT = 1280;

export const BREAKPOINTS = Object.freeze({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
});

export const CHART_COLORS = Object.freeze({
  primary: '#8B5CF6',
  secondary: '#6366F1',
  accent: '#1028F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  neutral: '#64748B',
});

export const CHART_GRADIENT = Object.freeze({
  primary: ['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0)'],
  success: ['rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0)'],
  error: ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0)'],
});

export const ASSET_ALLOCATION_COLORS = Object.freeze([
  '#6366F1',
  '#8B5CF6',
  '#F59E0B',
  '#F97316',
  '#10B981',
  '#3B82F6',
]);

export const Z_INDEX = Object.freeze({
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
});

export const ANIMATION_DURATION = Object.freeze({
  fast: 150,
  normal: 250,
  slow: 400,
});