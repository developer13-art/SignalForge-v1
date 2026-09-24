/**
 * useWebSocket Hook
 *
 * Manages a single Socket.IO connection shared across the app. The
 * connection is authenticated with the access token and exposes
 * subscribe/emit helpers. Each caller gets a scoped event listener
 * that is automatically cleaned up on unmount.
 *
 * @module client/src/hooks/useWebSocket
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

import apiConfig from '../config/api.config.js';
import appConfig from '../config/app.config.js';

function readAccessToken() {
  try {
    return localStorage.getItem(appConfig.storage.accessTokenKey) || null;
  } catch (err) {
    return null;
  }
}

let sharedSocket = null;

function getSharedSocket() {
  if (sharedSocket) {
    return sharedSocket;
  }

  const token = readAccessToken();

  sharedSocket = io(apiConfig.wsUrl, {
    path: '/realtime',
    transports: ['websocket'],
    autoConnect: false,
    withCredentials: true,
    auth: { token },
  });

  return sharedSocket;
}

export function useWebSocket() {
  const socketRef = useRef(getSharedSocket());
  const [connected, setConnected] = useState(socketRef.current.connected);

  useEffect(() => {
    const socket = socketRef.current;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (!socket.connected) {
      const token = readAccessToken();
      if (token) {
        socket.auth = { token };
        socket.connect();
      }
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const subscribe = useCallback((eventName, handler) => {
    const socket = socketRef.current;
    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, []);

  const emit = useCallback((eventName, payload) => {
    const socket = socketRef.current;
    socket.emit(eventName, payload);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    subscribe,
    emit,
  };
}

export function useRealtimeEvent(eventName, handler, { enabled = true } = {}) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    if (!enabled || typeof handler !== 'function') {
      return undefined;
    }

    const unsubscribe = subscribe(eventName, handler);
    return unsubscribe;
  }, [eventName, handler, enabled, subscribe]);
}

export function disconnectSharedSocket() {
  if (sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
  }
}