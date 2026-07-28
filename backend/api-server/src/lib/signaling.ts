import { WebSocket, WebSocketServer } from 'ws';
import { logger } from '../lib/logger';
import { Server } from 'http';

const pingTimeout = 30000;

// Map from topic-name to the set of clients subscribed to it.
// This matches y-webrtc's own reference signaling server protocol —
// see https://github.com/yjs/y-webrtc/blob/master/bin/server.js
const topics = new Map<string, Set<WebSocket>>();

function setIfUndefined<K, V>(map: Map<K, V>, key: K, createT: () => V): V {
  let value = map.get(key);
  if (value === undefined) {
    value = createT();
    map.set(key, value);
  }
  return value;
}

function send(conn: WebSocket, message: unknown) {
  if (conn.readyState !== WebSocket.CONNECTING && conn.readyState !== WebSocket.OPEN) {
    conn.close();
    return;
  }
  try {
    conn.send(JSON.stringify(message));
  } catch (e) {
    conn.close();
  }
}

function onConnection(conn: WebSocket) {
  const subscribedTopics = new Set<string>();
  let closed = false;
  let pongReceived = true;

  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      conn.close();
      clearInterval(pingInterval);
    } else {
      pongReceived = false;
      try {
        conn.ping();
      } catch (e) {
        conn.close();
      }
    }
  }, pingTimeout);

  conn.on('pong', () => {
    pongReceived = true;
  });

  conn.on('close', () => {
    subscribedTopics.forEach((topicName) => {
      const subs = topics.get(topicName) || new Set();
      subs.delete(conn);
      if (subs.size === 0) {
        topics.delete(topicName);
      }
    });
    subscribedTopics.clear();
    closed = true;
    clearInterval(pingInterval);
  });

  conn.on('message', (data) => {
    let message: any;
    try {
      message = JSON.parse(data.toString());
    } catch (e) {
      return;
    }
    if (!message || !message.type || closed) return;

    switch (message.type) {
      case 'subscribe':
        (message.topics || []).forEach((topicName: string) => {
          if (typeof topicName === 'string') {
            const topic = setIfUndefined(topics, topicName, () => new Set<WebSocket>());
            topic.add(conn);
            subscribedTopics.add(topicName);
          }
        });
        break;
      case 'unsubscribe':
        (message.topics || []).forEach((topicName: string) => {
          topics.get(topicName)?.delete(conn);
        });
        break;
      case 'publish':
        if (message.topic) {
          const receivers = topics.get(message.topic);
          if (receivers) {
            message.clients = receivers.size;
            receivers.forEach((receiver) => send(receiver, message));
          }
        }
        break;
      case 'ping':
        send(conn, { type: 'pong' });
        break;
    }
  });

  conn.on('error', (err) => {
    logger.error({ err }, 'Signaling WebSocket error');
  });
}

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

  wss.on('connection', onConnection);
  logger.info('Signaling server ready (y-webrtc protocol)');
  return wss;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
