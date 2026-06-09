import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMessages } from "../features/chat/useMessages.js";
import type { Socket } from "socket.io-client";

const makeSocket = () =>
  ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  }) as unknown as Socket;

const MSG = {
  id: "m1",
  text: "Hello",
  userId: "u1",
  roomId: "r1",
  createdAt: new Date().toISOString(),
  user: { id: "u1", username: "alice", avatarUrl: undefined },
};

describe("useMessages", () => {
  let socket: Socket;
  beforeEach(() => { socket = makeSocket(); });

  it("joins the room on mount", () => {
    renderHook(() => useMessages(socket, "r1", "u1"));
    expect(socket.emit).toHaveBeenCalledWith("room:join", { roomId: "r1" });
  });

  it("appends incoming message:new events to the list", () => {
    const { result } = renderHook(() => useMessages(socket, "r1", "u1"));
    const handler = vi.mocked(socket.on).mock.calls.find(([e]) => e === "message:new")?.[1] as (m: typeof MSG) => void;
    act(() => handler(MSG));
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]?.text).toBe("Hello");
  });

  it("adds a message optimistically when send() is called", () => {
    const { result } = renderHook(() => useMessages(socket, "r1", "u1"));
    act(() => result.current.send("Hi there"));
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]?.text).toBe("Hi there");
  });

  it("replaces the optimistic message when server echo arrives", () => {
    const { result } = renderHook(() => useMessages(socket, "r1", "u1"));
    act(() => result.current.send("Hi there"));
    const confirmedMsg = { ...MSG, id: "m-server", text: "Hi there", userId: "u1" };
    const handler = vi.mocked(socket.on).mock.calls.find(([e]) => e === "message:new")?.[1] as (m: typeof confirmedMsg) => void;
    act(() => handler(confirmedMsg));
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]?.id).toBe("m-server");
  });
});
