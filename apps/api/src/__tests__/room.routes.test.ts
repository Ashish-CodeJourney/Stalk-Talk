import { describe, it, expect, vi } from "vitest";
import { buildApp } from "../app.js";
import { signAccessToken } from "../services/token.service.js";
import type { PrismaClient } from "@prisma/client";

const JWT_SECRET = "test-secret-at-least-32-chars-long!!";
const REFRESH_SECRET = "refresh-secret-at-least-32-chars!!";

const mockRooms = [
  { id: "room-1", name: "general", createdAt: new Date() },
  { id: "room-2", name: "random", createdAt: new Date() },
];

const mockMessages = [
  {
    id: "msg-2",
    text: "World",
    userId: "user-2",
    roomId: "room-1",
    createdAt: new Date(),
    user: { id: "user-2", username: "bob", avatarUrl: null },
  },
  {
    id: "msg-1",
    text: "Hello",
    userId: "user-1",
    roomId: "room-1",
    createdAt: new Date(),
    user: { id: "user-1", username: "alice", avatarUrl: null },
  },
];

const mockMembers = [
  { user: { id: "user-1", username: "alice", avatarUrl: null } },
  { user: { id: "user-2", username: "bob", avatarUrl: null } },
];

const makePrisma = (overrides = {}) =>
  ({
    user: { findUnique: vi.fn().mockResolvedValue({ id: "user-1", username: "alice" }) },
    room: {
      findMany: vi.fn().mockResolvedValue(mockRooms),
      findUnique: vi.fn().mockResolvedValue(mockRooms[0]),
      create: vi.fn().mockResolvedValue({ id: "room-3", name: "new-room", createdAt: new Date() }),
    },
    message: { findMany: vi.fn().mockResolvedValue(mockMessages), count: vi.fn().mockResolvedValue(0) },
    roomMember: {
      upsert: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue(mockMembers),
    },
    ...overrides,
  }) as unknown as PrismaClient;

const authHeader = (userId = "user-1") => ({
  authorization: `Bearer ${signAccessToken({ userId, secret: JWT_SECRET })}`,
});

describe("GET /rooms", () => {
  it("returns 401 without auth", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/rooms" });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("returns list of rooms with valid token", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/rooms", headers: authHeader() });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(2);
    expect(res.json()[0].name).toBe("general");
    await app.close();
  });

  it("includes unreadCount 0 for rooms the user has not joined", async () => {
    const prisma = makePrisma();
    (prisma.roomMember.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const app = buildApp({ prisma, jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/rooms", headers: authHeader() });
    expect(res.json().every((r: { unreadCount: number }) => r.unreadCount === 0)).toBe(true);
    await app.close();
  });

  it("includes unreadCount of messages created after the member's lastReadAt", async () => {
    const prisma = makePrisma();
    (prisma.roomMember.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { roomId: "room-1", userId: "user-1", lastReadAt: new Date("2026-01-01"), joinedAt: new Date("2025-01-01") },
    ]);
    (prisma.message.count as ReturnType<typeof vi.fn>).mockResolvedValue(3);
    const app = buildApp({ prisma, jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/rooms", headers: authHeader() });
    const room1 = res.json().find((r: { id: string }) => r.id === "room-1");
    expect(room1.unreadCount).toBe(3);
    expect(prisma.message.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          roomId: "room-1",
          userId: { not: "user-1" },
          createdAt: { gt: new Date("2026-01-01") },
        }),
      })
    );
    await app.close();
  });
});

describe("POST /rooms/:id/read", () => {
  it("returns 401 without auth", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "POST", url: "/rooms/room-1/read" });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("upserts the member's lastReadAt and returns 204", async () => {
    const prisma = makePrisma();
    const app = buildApp({ prisma, jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "POST", url: "/rooms/room-1/read", headers: authHeader() });
    expect(res.statusCode).toBe(204);
    expect(prisma.roomMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_roomId: { userId: "user-1", roomId: "room-1" } },
        update: expect.objectContaining({ lastReadAt: expect.any(Date) }),
      })
    );
    await app.close();
  });
});

describe("POST /rooms", () => {
  it("returns 401 without auth", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "POST", url: "/rooms", payload: { name: "test" } });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("creates a room and returns 201 with the room", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({
      method: "POST",
      url: "/rooms",
      headers: authHeader(),
      payload: { name: "new-room" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().name).toBe("new-room");
    await app.close();
  });

  it("returns 400 when name is missing", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({
      method: "POST",
      url: "/rooms",
      headers: authHeader(),
      payload: {},
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it("returns 400 when name is empty", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({
      method: "POST",
      url: "/rooms",
      headers: authHeader(),
      payload: { name: "" },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it("returns 400 when name exceeds 50 characters", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({
      method: "POST",
      url: "/rooms",
      headers: authHeader(),
      payload: { name: "a".repeat(51) },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });
});

describe("GET /rooms/:id/messages", () => {
  it("returns 401 without auth", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/rooms/room-1/messages" });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("returns paginated messages for a room", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({
      method: "GET",
      url: "/rooms/room-1/messages",
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].text).toBe("Hello");
    await app.close();
  });

  it("accepts a cursor query param", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({
      method: "GET",
      url: "/rooms/room-1/messages?cursor=msg-1&limit=20",
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(200);
    await app.close();
  });

  it("returns 404 when room does not exist", async () => {
    const prisma = makePrisma();
    (prisma.room.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const app = buildApp({ prisma, jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({
      method: "GET",
      url: "/rooms/nonexistent/messages",
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(404);
    await app.close();
  });
});

describe("POST /rooms/:id/join", () => {
  it("returns 401 without auth", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "POST", url: "/rooms/room-1/join" });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("returns 404 when room does not exist", async () => {
    const prisma = makePrisma();
    (prisma.room.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const app = buildApp({ prisma, jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "POST", url: "/rooms/nonexistent/join", headers: authHeader() });
    expect(res.statusCode).toBe(404);
    await app.close();
  });

  it("upserts a RoomMember row and returns 204", async () => {
    const prisma = makePrisma();
    const app = buildApp({ prisma, jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "POST", url: "/rooms/room-1/join", headers: authHeader() });
    expect(res.statusCode).toBe(204);
    expect(prisma.roomMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_roomId: { userId: "user-1", roomId: "room-1" } },
      })
    );
    await app.close();
  });
});

describe("DELETE /rooms/:id/leave", () => {
  it("returns 401 without auth", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "DELETE", url: "/rooms/room-1/leave" });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("deletes the RoomMember row and returns 204", async () => {
    const prisma = makePrisma();
    const app = buildApp({ prisma, jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "DELETE", url: "/rooms/room-1/leave", headers: authHeader() });
    expect(res.statusCode).toBe(204);
    expect(prisma.roomMember.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", roomId: "room-1" },
    });
    await app.close();
  });
});

describe("GET /rooms/:id/members", () => {
  it("returns 401 without auth", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/rooms/room-1/members" });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("returns the list of member users", async () => {
    const app = buildApp({ prisma: makePrisma(), jwtSecret: JWT_SECRET, refreshSecret: REFRESH_SECRET });
    const res = await app.inject({ method: "GET", url: "/rooms/room-1/members", headers: authHeader() });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([
      { id: "user-1", username: "alice", avatarUrl: null },
      { id: "user-2", username: "bob", avatarUrl: null },
    ]);
    await app.close();
  });
});
