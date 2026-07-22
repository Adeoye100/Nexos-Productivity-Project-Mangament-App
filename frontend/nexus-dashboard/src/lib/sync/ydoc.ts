import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';

// Initialize a single shared Y.Doc for the app
export const ydoc = new Y.Doc();

// Persist the Y.Doc to IndexedDB
export const persistence = new IndexeddbPersistence('nexos-local', ydoc);

let webrtcProvider: WebrtcProvider | null = null;

export const connectToRoom = (roomCode: string) => {
  if (webrtcProvider) {
    webrtcProvider.destroy();
  }

  // Use the signaling server endpoint we created
  const signalingUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/signaling`;

  webrtcProvider = new WebrtcProvider(roomCode, ydoc, {
    signaling: [signalingUrl],
    peerOpts: {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          // TURN server configuration would go here.
          // Example for a TURN provider (e.g. Metered/Twilio):
          // {
          //   urls: 'turn:your-turn-server.com:3478',
          //   username: 'your-username',
          //   credential: 'your-password'
          // }
        ]
      }
    }
  });

  webrtcProvider.on('status', (event: any) => {
    console.log('WebRTC connection status:', event.status);
  });

  return webrtcProvider;
};

export const disconnectFromRoom = () => {
  if (webrtcProvider) {
    webrtcProvider.destroy();
    webrtcProvider = null;
  }
};

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
