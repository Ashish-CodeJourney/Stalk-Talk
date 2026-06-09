import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { CreateRoom } from "../features/rooms/CreateRoom.js";
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

describe("CreateRoom", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a name input and submit button", () => {
    wrap(<CreateRoom token="tok" onCreated={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("calls createRoom with the entered name on submit", async () => {
    vi.mocked(roomApi.createRoom).mockResolvedValue({
      id: "3",
      name: "cool-room",
      createdAt: new Date().toISOString(),
    });
    const onCreated = vi.fn();
    wrap(<CreateRoom token="tok" onCreated={onCreated} />);

    await userEvent.type(screen.getByRole("textbox"), "cool-room");
    await userEvent.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => expect(roomApi.createRoom).toHaveBeenCalledWith("tok", "cool-room"));
    expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ name: "cool-room" }));
  });

  it("shows a validation error when name is empty", async () => {
    wrap(<CreateRoom token="tok" onCreated={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it("disables the button while submitting", async () => {
    vi.mocked(roomApi.createRoom).mockReturnValue(new Promise(() => {}));
    wrap(<CreateRoom token="tok" onCreated={vi.fn()} />);
    await userEvent.type(screen.getByRole("textbox"), "room-name");
    await userEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });
});
