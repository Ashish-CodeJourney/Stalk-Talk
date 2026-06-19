import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HomePage } from "../features/home/HomePage.js";

describe("HomePage", () => {
  it("links GitHub sign-in to the API's OAuth endpoint, not the web app's own origin", () => {
    render(<HomePage />);
    const link = screen.getByRole("link", { name: /sign in with github/i });
    expect(link).toHaveAttribute("href", expect.stringMatching(/^https?:\/\/.+\/auth\/github$/));
  });
});
