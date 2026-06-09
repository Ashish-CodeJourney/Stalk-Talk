import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../services/token.service.js";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

export const makeAuthPreHandler =
  (jwtSecret: string) => async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
    try {
      const { userId } = verifyAccessToken({ token: auth.slice(7), secret: jwtSecret });
      req.userId = userId;
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }
  };
