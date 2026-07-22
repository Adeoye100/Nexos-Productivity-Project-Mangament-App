import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

// Initialize a single shared Y.Doc for the app
export const ydoc = new Y.Doc();

// Persist the Y.Doc to IndexedDB
export const persistence = new IndexeddbPersistence('nexos-local', ydoc);

persistence.on('synced', () => {
  console.log('Yjs content synced from IndexedDB');
});

// BroadcastChannel for cross-tab sync
const channel = new BroadcastChannel('nexos-sync');

// Listen for local updates and broadcast them
ydoc.on('update', (update, origin) => {
  // If origin is the channel itself, don't broadcast it back
  if (origin !== channel) {
    channel.postMessage(update);
  }
});

// Listen for updates from other tabs
channel.onmessage = (event) => {
  const update = event.data;
  if (update instanceof Uint8Array) {
    Y.applyUpdate(ydoc, update, channel);
  }
};
