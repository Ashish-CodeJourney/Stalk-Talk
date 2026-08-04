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

  // Ref access during render: consumers re-render on socket events (messages/presence/typing),
  // which is when this picks up the connected socket. Converting to state is a real fix but
  // changes connect/reconnect timing for every consumer — needs its own pass, not a lint fixup.
  // eslint-disable-next-line react-hooks/refs
  return socketRef.current;
};
