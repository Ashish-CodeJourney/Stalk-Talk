import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import type { PrismaClient } from "@prisma/client";
import { authRoutes } from "./routes/auth/auth.routes.js";
import { googleAuthRoutes } from "./routes/auth/google.auth.routes.js";
import { userRoutes } from "./routes/users/user.routes.js";
import { roomRoutes } from "./routes/rooms/room.routes.js";

export type RateLimitOptions = { max: number; timeWindow: string };

export type AppOptions = {
  prisma?: PrismaClient;
  jwtSecret?: string;
  refreshSecret?: string;
  rateLimit?: RateLimitOptions;
};

export const buildApp = (opts: AppOptions = {}) => {
  const app = Fastify();

  if (opts.rateLimit) {
    app.register(rateLimit, {
      ...opts.rateLimit,
      keyGenerator: (req) => req.ip ?? "global",
    });
  }

  app.register(cors);
  app.register(cookie);

  app.after(() => {
    app.get("/health", async () => ({ status: "ok" }));

    if (opts.prisma && opts.jwtSecret && opts.refreshSecret) {
      const authOpts = { prisma: opts.prisma, jwtSecret: opts.jwtSecret, refreshSecret: opts.refreshSecret };
      app.register(authRoutes, authOpts);
      app.register(googleAuthRoutes, authOpts);
      app.register(userRoutes, authOpts);
      app.register(roomRoutes, authOpts);
    }
  });

  return app;
};
