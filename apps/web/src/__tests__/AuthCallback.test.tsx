import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthCallback } from "../features/auth/AuthCallback.js";
import { AuthContext } from "../features/auth/AuthContext.js";
import type { AuthContextValue } from "../features/auth/AuthContext.js";

const mockLogin = vi.fn();
beforeEach(() => mockLogin.mockClear());

const renderCallback = (token: string | null) => {
  const path = token ? `/?token=${token}` : "/";
  const value: AuthContextValue = {
    token: null,
    isAuthenticated: false,
    login: mockLogin,
    logout: vi.fn(),
  };
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<AuthCallback />} />
          <Route path="/chat" element={<div>Chat page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("AuthCallback", () => {
  it("calls login with the token from the URL and redirects to /chat", () => {
    renderCallback("my-jwt-token");
    expect(mockLogin).toHaveBeenCalledWith("my-jwt-token");
    expect(screen.getByText("Chat page")).toBeInTheDocument();
  });

  it("redirects to home when no token in URL", () => {
    renderCallback(null);
    expect(mockLogin).not.toHaveBeenCalledWith(expect.any(String));
  });
});
