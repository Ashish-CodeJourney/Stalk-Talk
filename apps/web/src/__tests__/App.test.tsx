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

  it("renders a login link on the home page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });
});
