import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PresenceList } from "../features/chat/PresenceList.js";

describe("PresenceList", () => {
  it("renders nothing when no users are online", () => {
    const { container } = render(<PresenceList users={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the count and usernames of online users", () => {
    render(
      <PresenceList
        users={[
          { id: "u1", username: "alice", avatarUrl: null },
          { id: "u2", username: "bob", avatarUrl: null },
        ]}
      />
    );
    expect(screen.getByText(/2 online/i)).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
  });
});
