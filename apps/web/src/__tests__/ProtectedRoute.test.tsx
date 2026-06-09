import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute.js";
import { AuthContext } from "../features/auth/AuthContext.js";
import type { AuthContextValue } from "../features/auth/AuthContext.js";

const renderWithAuth = (value: AuthContextValue, initialPath = "/protected") =>
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Secret content</div>} />
          </Route>
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("ProtectedRoute", () => {
  it("renders children when authenticated", () => {
    renderWithAuth({ token: "valid-token", isAuthenticated: true, login: () => {}, logout: () => {} });
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("redirects to home when not authenticated", () => {
    renderWithAuth({ token: null, isAuthenticated: false, login: () => {}, logout: () => {} });
    expect(screen.getByText("Home page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });
});
