import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RoomPage } from "../features/chat/RoomPage.js";

vi.mock("../features/chat/ChatRoom.js", () => ({
  ChatRoom: ({ roomId }: { roomId: string }) => <div>chat room: {roomId}</div>,
}));

describe("RoomPage", () => {
  it("renders ChatRoom with the roomId from the URL", () => {
    render(
      <MemoryRouter initialEntries={["/chat/room-42"]}>
        <Routes>
          <Route path="/chat/:roomId" element={<RoomPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("chat room: room-42")).toBeInTheDocument();
  });
});
