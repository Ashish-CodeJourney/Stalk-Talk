import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageList } from "../features/chat/MessageList.js";
import type { Message } from "@stalk-talk/types";

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "msg-1",
  text: "Hello",
  userId: "user-1",
  roomId: "room-1",
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("MessageList", () => {
  it("renders each message text", () => {
    const messages = [
      makeMessage({ id: "1", text: "Hello" }),
      makeMessage({ id: "2", text: "World" }),
    ];
    render(<MessageList messages={messages} currentUserId="user-1" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("renders an empty state when there are no messages", () => {
    render(<MessageList messages={[]} currentUserId="user-1" />);
    expect(screen.getByText(/no messages/i)).toBeInTheDocument();
  });

  it("applies own-message styling for messages from the current user", () => {
    const messages = [makeMessage({ userId: "user-1", text: "My message" })];
    render(<MessageList messages={messages} currentUserId="user-1" />);
    const item = screen.getByText("My message").closest("li");
    expect(item?.className).toMatch(/own/);
  });

  it("does not apply own-message styling for other users messages", () => {
    const messages = [makeMessage({ userId: "user-2", text: "Their message" })];
    render(<MessageList messages={messages} currentUserId="user-1" />);
    const item = screen.getByText("Their message").closest("li");
    expect(item?.className).not.toMatch(/own/);
  });
});
