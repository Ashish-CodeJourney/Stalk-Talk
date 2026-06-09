import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCombinedMessages } from "../features/chat/useCombinedMessages.js";
import type { Message } from "@stalk-talk/types";

const msg = (id: string, text: string): Message => ({
  id,
  text,
  userId: "u1",
  roomId: "r1",
  createdAt: "2024-01-01T00:00:00Z",
});

describe("useCombinedMessages", () => {
  it("returns history messages when there are no real-time messages", () => {
    const { result } = renderHook(() =>
      useCombinedMessages([msg("h1", "History")], [])
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.text).toBe("History");
  });

  it("appends real-time messages after history", () => {
    const { result } = renderHook(() =>
      useCombinedMessages([msg("h1", "History")], [msg("r1", "Live")])
    );
    expect(result.current).toHaveLength(2);
    expect(result.current[0]?.text).toBe("History");
    expect(result.current[1]?.text).toBe("Live");
  });

  it("deduplicates messages that appear in both lists", () => {
    const shared = msg("m1", "Same");
    const { result } = renderHook(() =>
      useCombinedMessages([shared], [shared])
    );
    expect(result.current).toHaveLength(1);
  });

  it("deduplicates optimistic messages replaced by server-confirmed ones", () => {
    const optimistic = { ...msg("__opt__1", "Hello"), userId: "u1" };
    const confirmed = msg("server-1", "Hello");
    const { result } = renderHook(() =>
      useCombinedMessages([confirmed], [optimistic])
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.id).toBe("server-1");
  });
});
