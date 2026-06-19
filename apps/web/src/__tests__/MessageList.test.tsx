import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("shows an edited marker for messages with editedAt set", () => {
    const messages = [makeMessage({ text: "Updated", editedAt: new Date().toISOString() })];
    render(<MessageList messages={messages} currentUserId="user-1" />);
    expect(screen.getByText(/edited/i)).toBeInTheDocument();
  });

  it("shows a deleted placeholder instead of the text for deleted messages", () => {
    const messages = [makeMessage({ text: "secret", deletedAt: new Date().toISOString() })];
    render(<MessageList messages={messages} currentUserId="user-1" />);
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
    expect(screen.getByText(/message deleted/i)).toBeInTheDocument();
  });

  it("shows edit and delete controls only for the current user's own messages", () => {
    const messages = [
      makeMessage({ id: "own", userId: "user-1", text: "Mine" }),
      makeMessage({ id: "other", userId: "user-2", text: "Theirs" }),
    ];
    render(<MessageList messages={messages} currentUserId="user-1" />);
    expect(screen.getAllByRole("button", { name: /edit/i })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(1);
  });

  it("calls onEdit with the new text when an edit is submitted", () => {
    const onEdit = vi.fn();
    const messages = [makeMessage({ id: "msg-1", userId: "user-1", text: "Mine" })];
    render(<MessageList messages={messages} currentUserId="user-1" onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    const input = screen.getByDisplayValue("Mine");
    fireEvent.change(input, { target: { value: "Mine, edited" } });
    fireEvent.submit(input);
    expect(onEdit).toHaveBeenCalledWith("msg-1", "Mine, edited");
  });

  it("calls onDelete when the delete button is clicked", () => {
    const onDelete = vi.fn();
    const messages = [makeMessage({ id: "msg-1", userId: "user-1", text: "Mine" })];
    render(<MessageList messages={messages} currentUserId="user-1" onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("msg-1");
  });

  it("shows reaction pills for a message's reactions", () => {
    const messages = [
      makeMessage({ reactions: [{ emoji: "👍", userIds: ["user-2"] }] }),
    ];
    render(<MessageList messages={messages} currentUserId="user-1" />);
    expect(screen.getByText("👍")).toBeInTheDocument();
  });

  it("calls onReact with the message id and emoji when a reaction is toggled", () => {
    const onReact = vi.fn();
    const messages = [
      makeMessage({ id: "msg-1", reactions: [{ emoji: "👍", userIds: ["user-2"] }] }),
    ];
    render(<MessageList messages={messages} currentUserId="user-1" onReact={onReact} />);
    fireEvent.click(screen.getByRole("button", { name: /👍 1/ }));
    expect(onReact).toHaveBeenCalledWith("msg-1", "👍");
  });

  it("does not show reactions for deleted messages", () => {
    const messages = [
      makeMessage({ deletedAt: new Date().toISOString(), reactions: [{ emoji: "👍", userIds: ["user-2"] }] }),
    ];
    render(<MessageList messages={messages} currentUserId="user-1" />);
    expect(screen.queryByText("👍")).not.toBeInTheDocument();
  });
});
