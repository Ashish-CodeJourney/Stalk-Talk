import { createContext, useContext } from "react";

export type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuthContext = () => useContext(AuthContext);
