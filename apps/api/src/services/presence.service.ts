import type Redis from "ioredis";

export const presenceKey = (roomId: string, userId: string) =>
  `presence:${roomId}:${userId}`;

export const setUserOnline = (redis: Redis, roomId: string, userId: string) =>
  redis.set(presenceKey(roomId, userId), "1", "EX", 30);

export const setUserOffline = (redis: Redis, roomId: string, userId: string) =>
  redis.del(presenceKey(roomId, userId));

export const getOnlineUserIds = async (redis: Redis, roomId: string): Promise<string[]> => {
  const keys = await redis.keys(`presence:${roomId}:*`);
  return keys.map((k) => k.split(":")[2] as string);
};
