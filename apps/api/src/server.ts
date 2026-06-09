import { buildApp } from "./app.js";
import { createSocketServer } from "./socket/socket.server.js";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const DATABASE_URL = process.env["DATABASE_URL"] ?? "postgresql://stalktalk:stalktalk@localhost:5432/stalktalk";
const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";
const JWT_SECRET = process.env["JWT_SECRET"] ?? "dev-jwt-secret-change-in-production";
const REFRESH_SECRET = process.env["REFRESH_SECRET"] ?? "dev-refresh-secret-change-in-production";
const FRONTEND_URL = process.env["FRONTEND_URL"] ?? "http://localhost:5173";

const prisma = new PrismaClient();
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
