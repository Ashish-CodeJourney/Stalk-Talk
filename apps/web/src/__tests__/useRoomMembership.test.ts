import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRoomMembership } from "../features/rooms/useRoomMembership.js";
import * as roomApi from "../features/rooms/room.api.js";

vi.mock("../features/rooms/room.api.js");

describe("useRoomMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(roomApi.joinRoom).mockResolvedValue(undefined);
    vi.mocked(roomApi.leaveRoom).mockResolvedValue(undefined);
  });

  it("joins the room automatically on mount", async () => {
    renderHook(() => useRoomMembership("token", "room-1"));
    await waitFor(() => expect(roomApi.joinRoom).toHaveBeenCalledWith("token", "room-1"));
  });

  it("does not join when token is null", () => {
    renderHook(() => useRoomMembership(null, "room-1"));
    expect(roomApi.joinRoom).not.toHaveBeenCalled();
  });

  it("exposes a leave function that calls leaveRoom", async () => {
    const { result } = renderHook(() => useRoomMembership("token", "room-1"));
    await result.current.leave();
    expect(roomApi.leaveRoom).toHaveBeenCalledWith("token", "room-1");
  });
});
