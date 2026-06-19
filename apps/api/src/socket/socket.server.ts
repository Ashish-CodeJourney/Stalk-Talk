import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import type { PrismaClient } from "@prisma/client";
import type Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import { verifyAccessToken } from "../services/token.service.js";
import { makeRoomHandlers } from "./handlers/room.handler.js";
import { makeMessageHandler } from "./handlers/message.handler.js";
import { makeTypingHandlers } from "./handlers/typing.handler.js";

type SocketServerOptions = {
  httpServer: HttpServer;
  prisma: PrismaClient;
  redis: Redis;
  pubClient: Redis;
  subClient: Redis;
  jwtSecret: string;
  corsOrigin: string;
};

export const createSocketServer = ({
  httpServer,
  prisma,
  redis,
  pubClient,
  subClient,
  jwtSecret,
  corsOrigin,
}: SocketServerOptions) => {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, methods: ["GET", "POST"] },
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    const token = socket.handshake.auth["token"] as string | undefined;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const { userId } = verifyAccessToken({ token, secret: jwtSecret });
      socket.userId = userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  const roomHandlers = makeRoomHandlers(io, prisma, redis);
  const messageHandler = makeMessageHandler(io, prisma);
  const typingHandlers = makeTypingHandlers();

  io.on("connection", (socket) => {
    socket.on("room:join", (payload) => roomHandlers.onJoin(socket, payload));
    socket.on("room:leave", (payload) => roomHandlers.onLeave(socket, payload));
    socket.on("message:send", (payload) => messageHandler.onSend(socket, payload));
    socket.on("message:edit", (payload) => messageHandler.onEdit(socket, payload));
    socket.on("message:delete", (payload) => messageHandler.onDelete(socket, payload));
    socket.on("typing:start", (payload) => typingHandlers.onTypingStart(socket, payload));
    socket.on("typing:stop", (payload) => typingHandlers.onTypingStop(socket, payload));

    socket.on("disconnecting", async () => {
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id && socket.userId) {
          await roomHandlers.onLeave(socket, { roomId });
        }
      }
    });
  });

  return io;
};
