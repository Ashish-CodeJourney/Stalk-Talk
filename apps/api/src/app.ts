import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import type { PrismaClient } from "@prisma/client";
import { authRoutes } from "./routes/auth/auth.routes.js";
import { userRoutes } from "./routes/users/user.routes.js";
import { roomRoutes } from "./routes/rooms/room.routes.js";

export type AppOptions = {
  prisma: PrismaClient;
  jwtSecret: string;
  refreshSecret: string;
};

export const buildApp = (opts?: AppOptions) => {
  const app = Fastify();

  app.register(cors);
  app.register(cookie);

  app.get("/health", async () => ({ status: "ok" }));

  if (opts) {
    app.register(authRoutes, opts);
    app.register(userRoutes, opts);
    app.register(roomRoutes, opts);
  }

  return app;
};
