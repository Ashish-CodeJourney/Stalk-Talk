import { useState, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";

type TypingUpdate = { roomId: string; userId: string; isTyping: boolean };

const DEBOUNCE_MS = 1500;

export const useTyping = (socket: Socket | null, roomId: string) => {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onUpdate = ({ userId, isTyping }: TypingUpdate) =>
      setTypingUserIds((prev) =>
        isTyping ? [...new Set([...prev, userId])] : prev.filter((id) => id !== userId)
      );

    socket.on("typing:update", onUpdate);
    return () => { socket.off("typing:update", onUpdate); };
  }, [socket]);

  const notifyTyping = () => {
    socket?.emit("typing:start", { roomId });
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => {
      socket?.emit("typing:stop", { roomId });
    }, DEBOUNCE_MS);
  };

  return { typingUserIds, notifyTyping };
};
