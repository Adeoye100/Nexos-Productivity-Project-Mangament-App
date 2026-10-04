import { EventEmitter } from 'events';
import { describe, it, expect, beforeEach } from 'vitest';
import { onConnection, topics } from './signaling';
import type { WebSocket } from 'ws';

class MockWebSocket extends EventEmitter {
  readyState = 1; // WebSocket.OPEN
  sent: string[] = [];
  closed = false;

  send(data: string) {
    if (this.closed) return;
    this.sent.push(data);
  }

  close() {
    this.closed = true;
    this.readyState = 3; // WebSocket.CLOSED
    this.emit('close');
  }

  ping() {
    // mock ping implementation
  }
}

function createMockSocket(): MockWebSocket {
  const ws = new MockWebSocket();
  onConnection(ws as unknown as WebSocket);
  return ws;
}

describe('Signaling Server Protocol (signaling.ts)', () => {
  beforeEach(() => {
    topics.clear();
  });

  it('correctly adds client to topic subscriber set on subscribe', () => {
    const client = createMockSocket();
    client.emit('message', Buffer.from(JSON.stringify({
      type: 'subscribe',
      topics: ['room-alpha', 'room-beta'],
    })));

    expect(topics.has('room-alpha')).toBe(true);
    expect(topics.has('room-beta')).toBe(true);
    expect(topics.get('room-alpha')?.has(client as unknown as WebSocket)).toBe(true);
    expect(topics.get('room-beta')?.has(client as unknown as WebSocket)).toBe(true);
  });

  it('delivers published message to other subscribers of the topic, not subscribers of a different topic, and not the sender', () => {
    const clientA = createMockSocket();
    const clientB = createMockSocket();
    const clientC = createMockSocket();

    // Subscribe A and B to topic-1, C to topic-2
    clientA.emit('message', Buffer.from(JSON.stringify({ type: 'subscribe', topics: ['topic-1'] })));
    clientB.emit('message', Buffer.from(JSON.stringify({ type: 'subscribe', topics: ['topic-1'] })));
    clientC.emit('message', Buffer.from(JSON.stringify({ type: 'subscribe', topics: ['topic-2'] })));

    // Client A publishes to topic-1
    const publishMsg = { type: 'publish', topic: 'topic-1', data: 'hello' };
    clientA.emit('message', Buffer.from(JSON.stringify(publishMsg)));

    // Client B (other subscriber of topic-1) must receive the message
    expect(clientB.sent.length).toBe(1);
    expect(JSON.parse(clientB.sent[0])).toMatchObject({
      type: 'publish',
      topic: 'topic-1',
      data: 'hello',
    });

    // Client C (subscriber of topic-2) must NOT receive the message
    expect(clientC.sent.length).toBe(0);

    // Client A (the sender) must NOT receive its own published message back
    expect(clientA.sent.length).toBe(0);
  });

  it('responds with pong when client sends ping', () => {
    const client = createMockSocket();
    client.emit('message', Buffer.from(JSON.stringify({ type: 'ping' })));

    expect(client.sent.length).toBe(1);
    expect(JSON.parse(client.sent[0])).toEqual({ type: 'pong' });
  });

  it('removes disconnected client from topics and deletes empty topics on disconnect', () => {
    const clientA = createMockSocket();
    const clientB = createMockSocket();

    clientA.emit('message', Buffer.from(JSON.stringify({ type: 'subscribe', topics: ['room-cleanup'] })));
    clientB.emit('message', Buffer.from(JSON.stringify({ type: 'subscribe', topics: ['room-cleanup'] })));

    expect(topics.get('room-cleanup')?.size).toBe(2);

    // Disconnect clientA
    clientA.close();
    expect(topics.get('room-cleanup')?.size).toBe(1);
    expect(topics.get('room-cleanup')?.has(clientA as unknown as WebSocket)).toBe(false);
    expect(topics.has('room-cleanup')).toBe(true);

    // Disconnect clientB
    clientB.close();
    expect(topics.has('room-cleanup')).toBe(false);
  });
});
