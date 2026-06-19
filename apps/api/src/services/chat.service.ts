import type { PrismaClient } from "@prisma/client";

type SaveMessageArgs = { userId: string; roomId: string; text: string };
type EditMessageArgs = { messageId: string; userId: string; text: string };
type DeleteMessageArgs = { messageId: string; userId: string };

export const saveMessage = (prisma: PrismaClient, args: SaveMessageArgs) =>
  prisma.message.create({
    data: { userId: args.userId, roomId: args.roomId, text: args.text },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });

const assertAuthor = async (prisma: PrismaClient, messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Message not found");
  if (message.userId !== userId) throw new Error("Not authorized");
  return message;
};

export const editMessage = async (prisma: PrismaClient, args: EditMessageArgs) => {
  await assertAuthor(prisma, args.messageId, args.userId);
  return prisma.message.update({
    where: { id: args.messageId },
    data: { text: args.text, editedAt: new Date() },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });
};

export const softDeleteMessage = async (prisma: PrismaClient, args: DeleteMessageArgs) => {
  await assertAuthor(prisma, args.messageId, args.userId);
  return prisma.message.update({
    where: { id: args.messageId },
    data: { deletedAt: new Date() },
  });
};
