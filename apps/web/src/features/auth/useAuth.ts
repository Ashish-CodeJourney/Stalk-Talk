import { useState } from "react";

const STORAGE_KEY = "accessToken";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));

  const login = (newToken: string) => {
    sessionStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  return { token, isAuthenticated: token !== null, login, logout };
};
