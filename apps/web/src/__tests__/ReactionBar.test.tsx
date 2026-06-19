import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReactionBar } from "../features/chat/ReactionBar.js";

describe("ReactionBar", () => {
  it("renders only the add-reaction button when there are no reactions", () => {
    render(<ReactionBar reactions={[]} currentUserId="u1" onToggle={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add reaction/i })).toBeInTheDocument();
  });

  it("shows each reaction's emoji and count", () => {
    render(
      <ReactionBar
        reactions={[
          { emoji: "👍", userIds: ["u1", "u2"] },
          { emoji: "🎉", userIds: ["u2"] },
        ]}
        currentUserId="u1"
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByText("👍")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("🎉")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("calls onToggle with the emoji when a reaction pill is clicked", () => {
    const onToggle = vi.fn();
    render(
      <ReactionBar
        reactions={[{ emoji: "👍", userIds: ["u2"] }]}
        currentUserId="u1"
        onToggle={onToggle}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /👍 1/ }));
    expect(onToggle).toHaveBeenCalledWith("👍");
  });

  it("highlights reactions the current user has made", () => {
    render(
      <ReactionBar
        reactions={[{ emoji: "👍", userIds: ["u1"] }]}
        currentUserId="u1"
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /👍 1/ }).className).toMatch(/reacted/);
  });

  it("calls onToggle with the picked emoji when the add-reaction button is used", () => {
    const onToggle = vi.fn();
    render(<ReactionBar reactions={[]} currentUserId="u1" onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: /add reaction/i }));
    fireEvent.click(screen.getByRole("button", { name: "❤️" }));
    expect(onToggle).toHaveBeenCalledWith("❤️");
  });
});
