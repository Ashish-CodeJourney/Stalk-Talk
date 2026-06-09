import type { PrismaClient } from "@prisma/client";

type SaveMessageArgs = { userId: string; roomId: string; text: string };

export const saveMessage = (prisma: PrismaClient, args: SaveMessageArgs) =>
  prisma.message.create({
    data: { userId: args.userId, roomId: args.roomId, text: args.text },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });
