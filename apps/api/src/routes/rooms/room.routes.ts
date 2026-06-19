import type { FastifyInstance } from "fastify";
import type { AppOptions } from "../../app.js";
import { makeAuthPreHandler } from "../../middleware/auth.middleware.js";
import { groupReactions } from "../../services/reaction.service.js";
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

  app.get("/rooms", { preHandler: auth }, async (req, _reply) => {
    const [rooms, memberships] = await Promise.all([
      prisma.room.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.roomMember.findMany({ where: { userId: req.userId } }),
    ]);

    const unreadCounts = await Promise.all(
      memberships.map(async (m) => ({
        roomId: m.roomId,
        unreadCount: await prisma.message.count({
          where: {
            roomId: m.roomId,
            userId: { not: req.userId },
            createdAt: { gt: m.lastReadAt ?? m.joinedAt },
          },
        }),
      }))
    );
    const unreadByRoom = new Map(unreadCounts.map((u) => [u.roomId, u.unreadCount]));

    return rooms.map((room) => ({ ...room, unreadCount: unreadByRoom.get(room.id) ?? 0 }));
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
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          reactions: { select: { emoji: true, userId: true } },
        },
      });

      const ordered = messages
        .slice()
        .reverse()
        .map((m) => ({ ...m, reactions: groupReactions(m.reactions) }));
      const nextCursor = messages.length === limit ? messages[0]?.id : undefined;

      return { data: ordered, nextCursor };
    }
  );

  app.post<{ Params: { id: string } }>("/rooms/:id/join", { preHandler: auth }, async (req, reply) => {
    const room = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!room) return reply.status(404).send({ error: "Room not found" });

    await prisma.roomMember.upsert({
      where: { userId_roomId: { userId: req.userId!, roomId: req.params.id } },
      update: {},
      create: { userId: req.userId!, roomId: req.params.id },
    });
    return reply.status(204).send();
  });

  app.delete<{ Params: { id: string } }>("/rooms/:id/leave", { preHandler: auth }, async (req, reply) => {
    await prisma.roomMember.deleteMany({ where: { userId: req.userId!, roomId: req.params.id } });
    return reply.status(204).send();
  });

  app.post<{ Params: { id: string } }>("/rooms/:id/read", { preHandler: auth }, async (req, reply) => {
    await prisma.roomMember.upsert({
      where: { userId_roomId: { userId: req.userId!, roomId: req.params.id } },
      update: { lastReadAt: new Date() },
      create: { userId: req.userId!, roomId: req.params.id, lastReadAt: new Date() },
    });
    return reply.status(204).send();
  });

  app.get<{ Params: { id: string } }>("/rooms/:id/members", { preHandler: auth }, async (req, reply) => {
    const room = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!room) return reply.status(404).send({ error: "Room not found" });

    const members = await prisma.roomMember.findMany({
      where: { roomId: req.params.id },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } },
    });
    return members.map((m) => m.user);
  });
};
