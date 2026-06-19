import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePresence } from "../features/chat/usePresence.js";
import type { Socket } from "socket.io-client";

const makeSocket = () =>
  ({
    on: vi.fn(),
    off: vi.fn(),
  }) as unknown as Socket;

describe("usePresence", () => {
  let socket: Socket;
  beforeEach(() => { socket = makeSocket(); });

  it("starts with an empty user list", () => {
    const { result } = renderHook(() => usePresence(socket));
    expect(result.current).toEqual([]);
  });

  it("updates the user list when room:users is received", () => {
    const { result } = renderHook(() => usePresence(socket));
    const handler = vi.mocked(socket.on).mock.calls.find(([e]) => e === "room:users")?.[1] as (
      e: { roomId: string; users: { id: string; username: string; avatarUrl: string | null }[] }
    ) => void;
    act(() => handler({ roomId: "room-1", users: [{ id: "u1", username: "alice", avatarUrl: null }] }));
    expect(result.current).toEqual([{ id: "u1", username: "alice", avatarUrl: null }]);
  });

  it("unsubscribes from room:users on unmount", () => {
    const { unmount } = renderHook(() => usePresence(socket));
    unmount();
    expect(socket.off).toHaveBeenCalledWith("room:users", expect.any(Function));
  });

  it("returns an empty list when socket is null", () => {
    const { result } = renderHook(() => usePresence(null));
    expect(result.current).toEqual([]);
  });
});
