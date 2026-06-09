import type { FastifyInstance } from "fastify";
import type { AppOptions } from "../../app.js";
import { verifyAccessToken } from "../../services/token.service.js";

export const userRoutes = async (app: FastifyInstance, opts: AppOptions) => {
  const { prisma, jwtSecret } = opts;

  app.get("/users/me", async (req, reply) => {
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) return reply.status(401).send({ error: "Unauthorized" });

    let userId: string;
    try {
      ({ userId } = verifyAccessToken({ token: auth.slice(7), secret: jwtSecret }));
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(404).send({ error: "User not found" });

    const { refreshToken: _, ...safeUser } = user;
    return safeUser;
  });
};
