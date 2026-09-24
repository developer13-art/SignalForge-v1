/**
 * UI Slice
 *
 * Redux slice for cross-cutting UI state: sidebar visibility,
 * theme, locale, modals, drawers, breadcrumbs, and active navigation.
 *
 * @module client/src/store/slices/ui.slice
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: false,
  mobileNavOpen: false,
  commandPaletteOpen: false,
  theme: 'dark',
  locale: 'en',
  breadcrumbs: [],
  activePath: '/',
  modals: {},
  drawers: {},
  toasts: [],
  dismissedBanners: {},
  loadingBar: {
    visible: false,
    progress: 0,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = Boolean(action.payload);
    },
    toggleMobileNav(state) {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
    setMobileNavOpen(state, action) {
      state.mobileNavOpen = Boolean(action.payload);
    },
    toggleCommandPalette(state) {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
    setCommandPaletteOpen(state, action) {
      state.commandPaletteOpen = Boolean(action.payload);
    },
    setTheme(state, action) {
      state.theme = action.payload || 'dark';
    },
    setLocale(state, action) {
      state.locale = action.payload || 'en';
    },
    setBreadcrumbs(state, action) {
      state.breadcrumbs = action.payload || [];
    },
    setActivePath(state, action) {
      state.activePath = action.payload || '/';
    },
    openModal(state, action) {
      const key = action.payload;
      state.modals[key] = true;
    },
    closeModal(state, action) {
      const key = action.payload;
      state.modals[key] = false;
    },
    openDrawer(state, action) {
      const key = action.payload;
      state.drawers[key] = true;
    },
    closeDrawer(state, action) {
      const key = action.payload;
      state.drawers[key] = false;
    },
    pushToast(state, action) {
      state.toasts = [...state.toasts, action.payload];
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
    dismissBanner(state, action) {
      state.dismissedBanners[action.payload] = true;
    },
    restoreBanner(state, action) {
      delete state.dismissedBanners[action.payload];
    },
    startLoadingBar(state) {
      state.loadingBar.visible = true;
      state.loadingBar.progress = 10;
    },
    updateLoadingBar(state, action) {
      state.loadingBar.progress = action.payload;
    },
    finishLoadingBar(state) {
      state.loadingBar.visible = false;
      state.loadingBar.progress = 100;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileNav,
  setMobileNavOpen,
  toggleCommandPalette,
  setCommandPaletteOpen,
  setTheme,
  setLocale,
  setBreadcrumbs,
  setActivePath,
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  pushToast,
  dismissToast,
  clearToasts,
  dismissBanner,
  restoreBanner,
  startLoadingBar,
  updateLoadingBar,
  finishLoadingBar,
} = uiSlice.actions;

export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectMobileNavOpen = (state) => state.ui.mobileNavOpen;
export const selectCommandPaletteOpen = (state) => state.ui.commandPaletteOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectLocale = (state) => state.ui.locale;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectActivePath = (state) => state.ui.activePath;
export const selectModals = (state) => state.ui.modals;
export const selectDrawers = (state) => state.ui.drawers;
export const selectToasts = (state) => state.ui.toasts;
export const selectDismissedBanners = (state) => state.ui.dismissedBanners;
export const selectLoadingBar = (state) => state.ui.loadingBar;

export default uiSlice.reducer;