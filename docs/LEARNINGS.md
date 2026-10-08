# Nexos Engineering Learnings

1. **Protocol Handshakes vs Implementation**: A handshake succeeding (HTTP 101) does not mean the protocol is correct. When migrating signaling to PartyKit (`backend/partykit-server/src/server.ts`), we had to strictly implement `y-webrtc`'s exact pub/sub logic (`subscribe`, `publish`, `ping`).
2. **WebRTC Pub/Sub Loops**: The `y-webrtc` protocol explicitly requires the server to drop the sender from the broadcast list (`if (connId !== sender.id)`), otherwise clients process their own updates twice.
3. **Vite Dev Server Allowed Hosts**: Localhost on a phone is the phone itself. To tunnel the Vite dev server for testing (`vite.config.ts`), `server.allowedHosts: true` is strictly required.
4. **Vite Preview vs Dev**: The Vite dev proxy (for `/api` and `/signaling`) does not apply to `vite preview` automatically unless explicitly duplicated in the `preview: { proxy: ... }` block in `vite.config.ts`.
5. **Serverless AI Proxies**: PartyKit handles standard HTTP `onFetch` gracefully alongside WebSockets. This allowed us to preserve the Express `request/response` contract for the `/api/chat` fallback seamlessly (see `server.ts`).
6. **Hardcoded Secrets**: Never commit real keys. In commit `004128a`, an `OPENWEATHER_API_KEY` was committed directly into a test file, requiring either a rotated key or a rewritten git history before the repository can ever be made public.
7. **Client-Side Environment Variables**: Vite requires the `VITE_` prefix for client-exposed variables. Storing a GitHub PAT in the frontend environment fundamentally compromises the token since it must be sent directly to the client browser.
8. **Linux WebStorm Crashes**: We discovered that Java's `X11FontManager` bug on Ubuntu (triggered by the `fonts-symbola` package) causes IDEs like WebStorm to silently crash on startup.
