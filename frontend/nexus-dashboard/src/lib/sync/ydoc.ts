import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

// Initialize a single shared Y.Doc for the app
export const ydoc = new Y.Doc();

// Persist the Y.Doc to IndexedDB
export const persistence = new IndexeddbPersistence('nexos-local', ydoc);

persistence.on('synced', () => {
  console.log('Yjs content synced from IndexedDB');
});
