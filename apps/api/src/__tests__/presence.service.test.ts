import { describe, it, expect, vi } from "vitest";
import {
  setUserOnline,
  setUserOffline,
  getOnlineUserIds,
  presenceKey,
} from "../services/presence.service.js";
import type Redis from "ioredis";

const makeRedis = () =>
  ({
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue(["presence:room-1:user-1", "presence:room-1:user-2"]),
  }) as unknown as Redis;

describe("presenceKey", () => {
  it("builds a namespaced key from roomId and userId", () => {
    expect(presenceKey("room-1", "user-99")).toBe("presence:room-1:user-99");
  });
});

describe("setUserOnline", () => {
  it("sets a Redis key with 30-second TTL", async () => {
    const redis = makeRedis();
    await setUserOnline(redis, "room-1", "user-1");
    expect(redis.set).toHaveBeenCalledWith("presence:room-1:user-1", "1", "EX", 30);
  });
});

describe("setUserOffline", () => {
  it("deletes the Redis presence key", async () => {
    const redis = makeRedis();
    await setUserOffline(redis, "room-1", "user-1");
    expect(redis.del).toHaveBeenCalledWith("presence:room-1:user-1");
  });
});

describe("getOnlineUserIds", () => {
  it("returns user IDs extracted from matching Redis keys", async () => {
    const redis = makeRedis();
    const ids = await getOnlineUserIds(redis, "room-1");
    expect(ids).toEqual(["user-1", "user-2"]);
  });

  it("returns empty array when no users are online", async () => {
    const redis = makeRedis();
    (redis.keys as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const ids = await getOnlineUserIds(redis, "room-1");
    expect(ids).toEqual([]);
  });
});
