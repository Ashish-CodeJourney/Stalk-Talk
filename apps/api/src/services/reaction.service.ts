import type { PrismaClient } from "@prisma/client";

type ToggleReactionArgs = { messageId: string; userId: string; emoji: string };
type RawReaction = { emoji: string; userId: string };

export const groupReactions = (reactions: RawReaction[]) => {
  const byEmoji = new Map<string, string[]>();
  for (const r of reactions) {
    const userIds = byEmoji.get(r.emoji) ?? [];
    userIds.push(r.userId);
    byEmoji.set(r.emoji, userIds);
  }
  return [...byEmoji.entries()].map(([emoji, userIds]) => ({ emoji, userIds }));
};

export const toggleReaction = async (prisma: PrismaClient, args: ToggleReactionArgs) => {
  const { messageId, userId, emoji } = args;

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Message not found");

  const existing = await prisma.reaction.findUnique({
    where: { userId_messageId_emoji: { userId, messageId, emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { userId, messageId, emoji } });
  }

  const all = await prisma.reaction.findMany({ where: { messageId } });

  return { roomId: message.roomId, reactions: groupReactions(all) };
};
