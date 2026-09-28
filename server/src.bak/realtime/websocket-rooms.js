/**
 * WebSocket Rooms
 *
 * Manages rooms that multiple sockets can join. Rooms are grouped by
 * scope (user, tenant, admin). The room service is not persisted; it
 * lives only for the lifetime of the process.
 *
 * @module server/realtime/websocket-rooms
 */

import { logger } from '../lib/logger';

const ROOMS = new Map();

function roomKey({ scope, id }) {
  return `${scope}:${id}`;
}

export function joinRoom({ socket, scope, id }) {
  if (!socket || !scope || !id) {
    throw new Error('socket, scope, and id are required');
  }

  const key = roomKey({ scope, id });

  if (!ROOMS.has(key)) {
    ROOMS.set(key, new Set());
  }

  ROOMS.get(key).add(socket.id);

  socket.join(key);

  logger.debug({ socketId: socket.id, room: key }, 'Socket joined room');

  return { joined: true, room: key };
}

export function leaveRoom({ socket, scope, id }) {
  if (!socket || !scope || !id) {
    return { left: false };
  }

  const key = roomKey({ scope, id });

  const set = ROOMS.get(key);

  if (set) {
    set.delete(socket.id);
    if (set.size === 0) {
      ROOMS.delete(key);
    }
  }

  socket.leave(key);

  return { left: true, room: key };
}

export function listRoomMembers({ scope, id }) {
  const key = roomKey({ scope, id });
  const set = ROOMS.get(key);
  return set ? Array.from(set) : [];
}

export function removeSocketFromAllRooms({ socketId }) {
  for (const [key, set] of ROOMS.entries()) {
    set.delete(socketId);
    if (set.size === 0) {
      ROOMS.delete(key);
    }
  }
}

export function listRooms() {
  return Array.from(ROOMS.entries()).map(([key, set]) => ({
    room: key,
    memberCount: set.size,
  }));
}

export const roomService = {
  joinRoom,
  leaveRoom,
  listRoomMembers,
  removeSocketFromAllRooms,
  listRooms,
};