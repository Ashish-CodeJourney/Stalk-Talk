import { buildApp } from "./app.js";
import { createSocketServer } from "./socket/socket.server.js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Redis from "ioredis";

try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch {
  // .env is optional (e.g. when env vars are injected by the host)
}

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://stalktalk:stalktalk@localhost:5433/stalktalk";
const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";
const JWT_SECRET = process.env["JWT_SECRET"] ?? "dev-jwt-secret-change-in-production";
const REFRESH_SECRET = process.env["REFRESH_SECRET"] ?? "dev-refresh-secret-change-in-production";
const FRONTEND_URL = process.env["FRONTEND_URL"] ?? "http://localhost:5173";

const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });
const redis = new Redis(REDIS_URL);
const pubClient = new Redis(REDIS_URL);
const subClient = pubClient.duplicate();

const app = buildApp({ prisma, jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });

app.listen({ port: 5000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  createSocketServer({
    httpServer: app.server,
    prisma,
    redis,
    pubClient,
    subClient,
    jwtSecret: JWT_SECRET,
    corsOrigin: FRONTEND_URL,
  });

  console.log(`API + Socket.IO listening at ${address}`);
});
