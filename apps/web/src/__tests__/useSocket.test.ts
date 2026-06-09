import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSocket } from "../features/chat/useSocket.js";

vi.mock("socket.io-client", () => {
  const socket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  };
  return { io: vi.fn().mockReturnValue(socket) };
});

import { io } from "socket.io-client";

describe("useSocket", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a socket with the token in auth handshake", () => {
    renderHook(() => useSocket("my-token"));
    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ auth: { token: "my-token" } })
    );
  });

  it("disconnects on unmount", () => {
    const { unmount } = renderHook(() => useSocket("tok"));
    const socket = vi.mocked(io).mock.results[0]?.value;
    unmount();
    expect(socket.disconnect).toHaveBeenCalled();
  });

  it("does not create a socket when token is null", () => {
    renderHook(() => useSocket(null));
    expect(io).not.toHaveBeenCalled();
  });
});
