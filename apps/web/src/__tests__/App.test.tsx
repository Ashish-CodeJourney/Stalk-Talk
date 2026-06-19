import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App.js";

describe("App", () => {
  it("renders the home page heading at root path", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /stalk talk/i })).toBeInTheDocument();
  });

  it("renders login links on the home page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /sign in with github/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in with google/i })).toBeInTheDocument();
  });
});
