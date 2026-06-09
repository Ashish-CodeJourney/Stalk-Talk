import type { FastifyInstance } from "fastify";
import type { AppOptions } from "../../app.js";
import { makeAuthPreHandler } from "../../middleware/auth.middleware.js";

export const userRoutes = async (app: FastifyInstance, opts: AppOptions) => {
  const { prisma, jwtSecret } = opts;
  const auth = makeAuthPreHandler(jwtSecret);

  app.get("/users/me", { preHandler: auth }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return reply.status(404).send({ error: "User not found" });
    const { refreshToken: _, ...safeUser } = user;
    return safeUser;
  });
};
