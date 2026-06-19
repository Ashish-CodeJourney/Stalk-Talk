import { useState, useEffect } from "react";
import type { Socket } from "socket.io-client";
import type { PresenceUser } from "@stalk-talk/types";

export const usePresence = (socket: Socket | null): PresenceUser[] => {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onRoomUsers = ({ users: next }: { roomId: string; users: PresenceUser[] }) => setUsers(next);

    socket.on("room:users", onRoomUsers);
    return () => { socket.off("room:users", onRoomUsers); };
  }, [socket]);

  return users;
};
