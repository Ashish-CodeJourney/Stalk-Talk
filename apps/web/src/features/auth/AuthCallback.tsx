import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "./AuthContext.js";

export const AuthCallback = () => {
  const [params] = useSearchParams();
  const { login } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      login(token);
      navigate("/chat", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
    // Run once on mount only: this consumes a one-time OAuth redirect token. Re-running on
    // param/login/navigate identity changes would double-fire login() or bounce navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
