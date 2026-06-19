import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ChatPage } from "../features/chat/ChatPage.js";
import * as roomApi from "../features/rooms/room.api.js";

vi.mock("../features/rooms/room.api.js");

const mockLogout = vi.fn();
vi.mock("../features/auth/AuthContext.js", () => ({
  useAuthContext: () => ({ token: "tok", isAuthenticated: true, login: vi.fn(), logout: mockLogout }),
}));

const wrap = (ui: React.ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("ChatPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(roomApi.fetchRooms).mockResolvedValue([]);
  });

  it("renders a sign-out button that calls logout when clicked", () => {
    wrap(<ChatPage />);
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
