/**
 * WebSocket Rooms
 *
 * Manages rooms that multiple sockets can join. Rooms are grouped by
 * scope (user, tenant, admin). The room service is not persisted; it
 * lives only for the lifetime of the process.
 *
 * @module server/realtime/websocket-rooms
 */
const { logger } = require('../lib/logger');

const ROOMS = new Map();

function roomKey({ scope, id }) {
  return `${scope}:${id}`;
}
function joinRoom({ socket, scope, id }) {
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
function leaveRoom({ socket, scope, id }) {
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
function listRoomMembers({ scope, id }) {
  const key = roomKey({ scope, id });
  const set = ROOMS.get(key);
  return set ? Array.from(set) : [];
}
function removeSocketFromAllRooms({ socketId }) {
  for (const [key, set] of ROOMS.entries()) {
    set.delete(socketId);
    if (set.size === 0) {
      ROOMS.delete(key);
    }
  }
}
function listRooms() {
  return Array.from(ROOMS.entries()).map(([key, set]) => ({
    room: key,
    memberCount: set.size,
  }));
}
const roomService = {
  joinRoom,
  leaveRoom,
  listRoomMembers,
  removeSocketFromAllRooms,
  listRooms,
};
module.exports.roomService = roomService;
module.exports.joinRoom = joinRoom;
module.exports.leaveRoom = leaveRoom;
module.exports.listRoomMembers = listRoomMembers;
module.exports.removeSocketFromAllRooms = removeSocketFromAllRooms;
module.exports.listRooms = listRooms;
