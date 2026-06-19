import { useState, useEffect } from "react";
import type { Socket } from "socket.io-client";
import type { Message, ReactionSummary } from "@stalk-talk/types";

const OPTIMISTIC_PREFIX = "__opt__";

export const useMessages = (socket: Socket | null, roomId: string, userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("room:join", { roomId });

    const onNew = (msg: Message) => {
      setMessages((prev) => {
        const optimisticIdx = prev.findIndex(
          (m) => m.id.startsWith(OPTIMISTIC_PREFIX) && m.userId === userId && m.text === msg.text
        );
        if (optimisticIdx !== -1) {
          const next = [...prev];
          next[optimisticIdx] = msg;
          return next;
        }
        return [...prev, msg];
      });
    };

    const onEdited = (msg: Message) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    };

    const onDeleted = ({ messageId }: { messageId: string; roomId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, deletedAt: new Date().toISOString() } : m))
      );
    };

    const onReactionUpdated = ({ messageId, reactions }: { messageId: string; roomId: string; reactions: ReactionSummary[] }) => {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)));
    };

    socket.on("message:new", onNew);
    socket.on("message:edited", onEdited);
    socket.on("message:deleted", onDeleted);
    socket.on("reaction:updated", onReactionUpdated);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:edited", onEdited);
      socket.off("message:deleted", onDeleted);
      socket.off("reaction:updated", onReactionUpdated);
      socket.emit("room:leave", { roomId });
      setMessages([]);
    };
  }, [socket, roomId, userId]);

  const send = (text: string) => {
    if (!socket) return;
    const optimistic: Message = {
      id: `${OPTIMISTIC_PREFIX}${Date.now()}`,
      text,
      userId: userId ?? "",
      roomId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    socket.emit("message:send", { roomId, text });
  };

  const edit = (messageId: string, text: string) => {
    socket?.emit("message:edit", { messageId, text });
  };

  const remove = (messageId: string) => {
    socket?.emit("message:delete", { messageId });
  };

  const react = (messageId: string, emoji: string) => {
    socket?.emit("reaction:toggle", { messageId, emoji });
  };

  return { messages, send, edit, remove, react };
};
