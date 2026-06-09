import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ProfilePage } from "../features/auth/ProfilePage.js";
import * as userApi from "../features/auth/user.api.js";

vi.mock("../features/auth/user.api.js");
vi.mock("../features/auth/AuthContext.js", () => ({
  useAuthContext: () => ({ token: "tok", isAuthenticated: true, login: vi.fn(), logout: vi.fn() }),
}));

const makeClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrap = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );

describe("ProfilePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a loading state while fetching the user", () => {
    vi.mocked(userApi.fetchMe).mockReturnValue(new Promise(() => {}));
    wrap(<ProfilePage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders username and email after successful fetch", async () => {
    vi.mocked(userApi.fetchMe).mockResolvedValue({
      id: "u1",
      username: "alice",
      email: "alice@example.com",
      provider: "github",
      providerId: "gh1",
      createdAt: new Date().toISOString(),
    });
    wrap(<ProfilePage />);
    await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("shows an error message when the fetch fails", async () => {
    vi.mocked(userApi.fetchMe).mockRejectedValue(new Error("Network error"));
    wrap(<ProfilePage />);
    await waitFor(() => expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument());
  });
});
