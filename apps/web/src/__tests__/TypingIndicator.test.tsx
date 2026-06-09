import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TypingIndicator } from "../features/chat/TypingIndicator.js";

describe("TypingIndicator", () => {
  it("renders nothing when no one is typing", () => {
    const { container } = render(<TypingIndicator typingUserIds={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a typing indicator when one user is typing", () => {
    render(<TypingIndicator typingUserIds={["user-2"]} />);
    expect(screen.getByText(/typing/i)).toBeInTheDocument();
  });

  it("renders a typing indicator when multiple users are typing", () => {
    render(<TypingIndicator typingUserIds={["user-2", "user-3"]} />);
    expect(screen.getByText(/typing/i)).toBeInTheDocument();
  });
});
