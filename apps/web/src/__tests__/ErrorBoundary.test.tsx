import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ErrorBoundary } from "../components/ErrorBoundary.js";

const Bomb = () => { throw new Error("boom"); };

describe("ErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    render(<ErrorBoundary><p>safe</p></ErrorBoundary>);
    expect(screen.getByText("safe")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
