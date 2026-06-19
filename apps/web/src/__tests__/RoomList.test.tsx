import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { RoomList } from "../features/rooms/RoomList.js";
import * as roomApi from "../features/rooms/room.api.js";

vi.mock("../features/rooms/room.api.js");

const wrap = (ui: React.ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("RoomList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a loading state while fetching", () => {
    vi.mocked(roomApi.fetchRooms).mockReturnValue(new Promise(() => {}));
    wrap(<RoomList token="tok" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders a list of room names", async () => {
    vi.mocked(roomApi.fetchRooms).mockResolvedValue([
      { id: "1", name: "general", createdAt: new Date().toISOString() },
      { id: "2", name: "random", createdAt: new Date().toISOString() },
    ]);
    wrap(<RoomList token="tok" />);
    await waitFor(() => expect(screen.getByText("general")).toBeInTheDocument());
    expect(screen.getByText("random")).toBeInTheDocument();
  });

  it("shows an error message when fetch fails", async () => {
    vi.mocked(roomApi.fetchRooms).mockRejectedValue(new Error("Network error"));
    wrap(<RoomList token="tok" />);
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
  });

  it("renders each room as a link", async () => {
    vi.mocked(roomApi.fetchRooms).mockResolvedValue([
      { id: "1", name: "general", createdAt: new Date().toISOString() },
    ]);
    wrap(<RoomList token="tok" />);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /general/ })).toBeInTheDocument()
    );
  });

  it("shows an unread count badge when a room has unread messages", async () => {
    vi.mocked(roomApi.fetchRooms).mockResolvedValue([
      { id: "1", name: "general", createdAt: new Date().toISOString(), unreadCount: 3 },
    ]);
    wrap(<RoomList token="tok" />);
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
  });

  it("does not show a badge when there are no unread messages", async () => {
    vi.mocked(roomApi.fetchRooms).mockResolvedValue([
      { id: "1", name: "general", createdAt: new Date().toISOString(), unreadCount: 0 },
    ]);
    wrap(<RoomList token="tok" />);
    await waitFor(() => expect(screen.getByText("general")).toBeInTheDocument());
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
