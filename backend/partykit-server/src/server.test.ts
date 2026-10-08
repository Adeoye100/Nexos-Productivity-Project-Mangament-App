import { describe, it, expect, beforeEach } from 'vitest';
import SignalingServer from './server';
import type * as Party from 'partykit/server';

// Mock PartyKit classes
class MockConnection implements Party.Connection {
  id: string;
  uri: string = '';
  readyState: number = 1;
  sent: string[] = [];

  constructor(id: string) {
    this.id = id;
  }
  
  send(data: string | ArrayBuffer | ArrayBufferView) {
    this.sent.push(data.toString());
  }

  close(code?: number, reason?: string) {}
  serializeAttachment(attachment: any): void {}
  deserializeAttachment(): any {}
  setState(state: any): void {}
  addEventListener(type: any, listener: any, options?: any): void {}
  removeEventListener(type: any, listener: any, options?: any): void {}
  dispatchEvent(event: any): boolean { return true; }
}

class MockRoom implements Party.Room {
  id: string = 'test-room';
  internalID: string = 'test-room-internal';
  env: Record<string, any> = {};
  storage: Party.Storage = {} as any;
  context: Party.RoomContext = {} as any;
  parties: Party.PartyFetchers = {} as any;
  
  connections = new Map<string, Party.Connection>();

  getConnection(id: string): Party.Connection | undefined {
    return this.connections.get(id);
  }

  getConnections(): IterableIterator<Party.Connection> {
    return this.connections.values();
  }
  
  broadcast(data: string | ArrayBuffer | ArrayBufferView, without?: string[] | undefined): void {
    for (const conn of this.connections.values()) {
      if (!without || !without.includes(conn.id)) {
        conn.send(data);
      }
    }
  }
}

describe('Signaling Server Protocol (PartyKit)', () => {
  let room: MockRoom;
  let server: SignalingServer;

  beforeEach(() => {
    room = new MockRoom();
    server = new SignalingServer(room);
  });

  function connectClient(id: string): MockConnection {
    const conn = new MockConnection(id);
    room.connections.set(id, conn);
    server.onConnect(conn, {} as any);
    return conn;
  }

  it('correctly adds client to topic subscriber set on subscribe', () => {
    const client = connectClient('client-1');
    server.onMessage(JSON.stringify({
      type: 'subscribe',
      topics: ['room-alpha', 'room-beta'],
    }), client);

    expect(server.topics.has('room-alpha')).toBe(true);
    expect(server.topics.has('room-beta')).toBe(true);
    expect(server.topics.get('room-alpha')?.has('client-1')).toBe(true);
    expect(server.topics.get('room-beta')?.has('client-1')).toBe(true);
  });

  it('delivers published message to other subscribers of the topic, not subscribers of a different topic, and not the sender', () => {
    const clientA = connectClient('client-a');
    const clientB = connectClient('client-b');
    const clientC = connectClient('client-c');

    server.onMessage(JSON.stringify({ type: 'subscribe', topics: ['topic-1'] }), clientA);
    server.onMessage(JSON.stringify({ type: 'subscribe', topics: ['topic-1'] }), clientB);
    server.onMessage(JSON.stringify({ type: 'subscribe', topics: ['topic-2'] }), clientC);

    const publishMsg = { type: 'publish', topic: 'topic-1', data: 'hello' };
    server.onMessage(JSON.stringify(publishMsg), clientA);

    expect(clientB.sent.length).toBe(1);
    expect(JSON.parse(clientB.sent[0])).toMatchObject({
      type: 'publish',
      topic: 'topic-1',
      data: 'hello',
    });

    expect(clientC.sent.length).toBe(0);
    expect(clientA.sent.length).toBe(0);
  });

  it('responds with pong when client sends ping', () => {
    const client = connectClient('client-1');
    server.onMessage(JSON.stringify({ type: 'ping' }), client);

    expect(client.sent.length).toBe(1);
    expect(JSON.parse(client.sent[0])).toEqual({ type: 'pong' });
  });

  it('removes disconnected client from topics and deletes empty topics on disconnect', () => {
    const clientA = connectClient('client-a');
    const clientB = connectClient('client-b');

    server.onMessage(JSON.stringify({ type: 'subscribe', topics: ['room-cleanup'] }), clientA);
    server.onMessage(JSON.stringify({ type: 'subscribe', topics: ['room-cleanup'] }), clientB);

    expect(server.topics.get('room-cleanup')?.size).toBe(2);

    server.onClose(clientA);
    
    expect(server.topics.get('room-cleanup')?.size).toBe(1);
    expect(server.topics.get('room-cleanup')?.has('client-a')).toBe(false);
    expect(server.topics.has('room-cleanup')).toBe(true);

    server.onClose(clientB);
    expect(server.topics.has('room-cleanup')).toBe(false);
  });
});
