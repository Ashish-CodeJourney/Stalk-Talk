import { useState, useEffect } from "react";
import type { Socket } from "socket.io-client";
import type { Message } from "@stalk-talk/types";

export const useMessages = (socket: Socket | null, roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("room:join", { roomId });

    const onNew = (msg: Message) => setMessages((prev) => [...prev, msg]);
    socket.on("message:new", onNew);

    return () => {
      socket.off("message:new", onNew);
      socket.emit("room:leave", { roomId });
      setMessages([]);
    };
  }, [socket, roomId]);

  const send = (text: string) => socket?.emit("message:send", { roomId, text });

  return { messages, send };
};
