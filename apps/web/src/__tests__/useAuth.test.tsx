import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../features/auth/useAuth.js";

describe("useAuth", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns null token when not authenticated", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("stores and returns the token after login", () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.login("my-access-token"));
    expect(result.current.token).toBe("my-access-token");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("clears the token after logout", () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.login("my-access-token"));
    act(() => result.current.logout());
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("reads token from sessionStorage on mount", () => {
    sessionStorage.setItem("accessToken", "persisted-token");
    const { result } = renderHook(() => useAuth());
    expect(result.current.token).toBe("persisted-token");
  });

  it("removes token from sessionStorage on logout", () => {
    sessionStorage.setItem("accessToken", "persisted-token");
    const { result } = renderHook(() => useAuth());
    act(() => result.current.logout());
    expect(sessionStorage.getItem("accessToken")).toBeNull();
  });
});
