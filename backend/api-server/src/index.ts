import 'dotenv/config';
import app from "./app";
import { logger } from "./lib/logger";
import { createServer } from "http";
import { setupSignalingServer } from "./lib/signaling";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = createServer(app);

setupSignalingServer(server);

server.listen(port, () => {
  logger.info({ port }, "Server listening");
});
