import type { FastifyInstance } from "fastify";
import type { AppOptions } from "../../app.js";
import { makeAuthPreHandler } from "../../middleware/auth.middleware.js";
import { RoomSchema } from "@stalk-talk/types";
import { z } from "zod";

const CreateRoomBody = z.object({ name: RoomSchema.shape.name });

const MessagesQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const PAGE_SIZE = 50;

export const roomRoutes = async (app: FastifyInstance, opts: AppOptions) => {
  const { prisma, jwtSecret } = opts;
  const auth = makeAuthPreHandler(jwtSecret);

  app.get("/rooms", { preHandler: auth }, async (_req, _reply) => {
    return prisma.room.findMany({ orderBy: { createdAt: "asc" } });
  });

  app.post<{ Body: unknown }>("/rooms", { preHandler: auth }, async (req, reply) => {
    const parsed = CreateRoomBody.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const room = await prisma.room.create({ data: { name: parsed.data.name } });
    return reply.status(201).send(room);
  });

  app.get<{ Params: { id: string }; Querystring: unknown }>(
    "/rooms/:id/messages",
    { preHandler: auth },
    async (req, reply) => {
      const room = await prisma.room.findUnique({ where: { id: req.params.id } });
      if (!room) return reply.status(404).send({ error: "Room not found" });

      const query = MessagesQuery.safeParse(req.query);
      const { cursor, limit } = query.success ? query.data : { cursor: undefined, limit: PAGE_SIZE };

      const messages = await prisma.message.findMany({
        where: { roomId: req.params.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      });

      const ordered = messages.slice().reverse();
      const nextCursor = messages.length === limit ? messages[0]?.id : undefined;

      return { data: ordered, nextCursor };
    }
  );
};
