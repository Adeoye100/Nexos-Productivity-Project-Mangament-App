import { WebSocket, WebSocketServer } from 'ws';
import { logger } from '../lib/logger';
import { Server } from 'http';

interface Room {
  clients: Set<WebSocket>;
  lastActive: number;
}

const rooms = new Map<string, Room>();
const ROOM_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// Cleanup expired rooms
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActive > ROOM_EXPIRY_MS) {
      logger.info({ code }, 'Expiring room code');
      room.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.close(1000, 'Room expired');
        }
      });
      rooms.delete(code);
    }
  }
}, 60 * 1000);

export function setupSignalingServer(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    if (url.pathname === '/signaling') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws, request) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const roomCode = url.searchParams.get('room');

    if (!roomCode) {
      ws.close(1008, 'Room code required');
      return;
    }

    let room = rooms.get(roomCode);
    if (!room) {
      room = { clients: new Set(), lastActive: Date.now() };
      rooms.set(roomCode, room);
    }

    room.clients.add(ws);
    room.lastActive = Date.now();

    logger.info({ roomCode, clientCount: room.clients.size }, 'Client joined room');

    ws.on('message', (data) => {
      if (!room) return;
      room.lastActive = Date.now();
      const message = data.toString();
      room.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      if (room) {
        room.clients.delete(ws);
        logger.info({ roomCode, clientCount: room.clients.size }, 'Client left room');
      }
    });

    ws.on('error', (err) => {
      logger.error({ err, roomCode }, 'WebSocket error');
    });
  });

  return wss;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  rooms.set(code, { clients: new Set(), lastActive: Date.now() });
  return code;
}
