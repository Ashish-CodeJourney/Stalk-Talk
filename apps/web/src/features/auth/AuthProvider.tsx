import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext.js";
import { useAuth } from "./useAuth.js";

export const AuthProvider = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={useAuth()}>{children}</AuthContext.Provider>
);
