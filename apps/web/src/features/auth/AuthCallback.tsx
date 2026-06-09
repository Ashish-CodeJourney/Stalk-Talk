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
  }, []);

  return null;
};
