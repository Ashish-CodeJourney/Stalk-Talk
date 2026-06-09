import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:5000";

export const useSocket = (token: string | null): Socket | null => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef.current;
};
