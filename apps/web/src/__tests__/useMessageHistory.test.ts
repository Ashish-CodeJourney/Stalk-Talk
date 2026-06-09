import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useMessageHistory } from "../features/chat/useMessageHistory.js";
import * as messageApi from "../features/chat/message.api.js";

vi.mock("../features/chat/message.api.js");

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, {
    client: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  }, children);

const PAGE1 = {
  data: [
    { id: "m1", text: "Old msg", userId: "u1", roomId: "r1", createdAt: "2024-01-01T00:00:00Z" },
  ],
  nextCursor: "m1",
};

const PAGE2 = {
  data: [
    { id: "m0", text: "Even older", userId: "u1", roomId: "r1", createdAt: "2024-01-01T00:00:00Z" },
  ],
  nextCursor: undefined,
};

describe("useMessageHistory", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches the first page of messages on mount", async () => {
    vi.mocked(messageApi.fetchMessages).mockResolvedValue(PAGE1);
    const { result } = renderHook(() => useMessageHistory("r1", "token"), { wrapper });
    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    expect(result.current.messages[0]?.text).toBe("Old msg");
  });

  it("indicates more pages are available when nextCursor is returned", async () => {
    vi.mocked(messageApi.fetchMessages).mockResolvedValue(PAGE1);
    const { result } = renderHook(() => useMessageHistory("r1", "token"), { wrapper });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
  });

  it("fetches the next page when fetchNextPage is called", async () => {
    vi.mocked(messageApi.fetchMessages)
      .mockResolvedValueOnce(PAGE1)
      .mockResolvedValueOnce(PAGE2);
    const { result } = renderHook(() => useMessageHistory("r1", "token"), { wrapper });
    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    result.current.fetchNextPage();
    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(false);
  });
});
