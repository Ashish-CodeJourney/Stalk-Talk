import { useEffect } from "react";
import { joinRoom, leaveRoom } from "./room.api.js";

export const useRoomMembership = (token: string | null, roomId: string) => {
  useEffect(() => {
    if (!token) return;
    joinRoom(token, roomId);
  }, [token, roomId]);

  const leave = () => {
    if (!token) return Promise.resolve();
    return leaveRoom(token, roomId);
  };

  return { leave };
};
