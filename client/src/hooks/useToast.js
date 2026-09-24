/**
 * useToast Hook
 *
 * Thin wrapper around `react-hot-toast` that applies the SignalForge
 * design language to every toast by default. Also exposes
 * confirmation helpers with consistent styling.
 *
 * @module client/src/hooks/useToast
 */

import { useCallback } from 'react';
import toast from 'react-hot-toast';

const DEFAULTS = {
  duration: 4000,
  position: 'top-right',
};

export function useToast() {
  const success = useCallback((message, options = {}) => {
    return toast.success(message, { ...DEFAULTS, ...options });
  }, []);

  const error = useCallback((message, options = {}) => {
    return toast.error(message, { ...DEFAULTS, duration: 6000, ...options });
  }, []);

  const info = useCallback((message, options = {}) => {
    return toast(message, { ...DEFAULTS, ...options });
  }, []);

  const loading = useCallback((message, options = {}) => {
    return toast.loading(message, { ...DEFAULTS, ...options });
  }, []);

  const dismiss = useCallback((id) => {
    toast.dismiss(id);
  }, []);

  const promise = useCallback((promiseValue, messages = {}, options = {}) => {
    return toast.promise(
      promiseValue,
      {
        loading: messages.loading || 'Working…',
        success: messages.success || 'Done',
        error: messages.error || 'Something went wrong',
      },
      { ...DEFAULTS, ...options },
    );
  }, []);

  return { success, error, info, loading, dismiss, promise };
}

export default useToast;