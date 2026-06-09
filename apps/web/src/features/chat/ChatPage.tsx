import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../auth/AuthContext.js";
import { RoomList } from "../rooms/RoomList.js";
import { CreateRoom } from "../rooms/CreateRoom.js";
import type { Room } from "@stalk-talk/types";

export const ChatPage = () => {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const handleCreated = (room: Room) => {
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
    setShowCreate(false);
  };

  if (!token) return null;

  return (
    <main>
      <h1>Rooms</h1>
      <button onClick={() => setShowCreate((v) => !v)}>
        {showCreate ? "Cancel" : "New room"}
      </button>
      {showCreate && <CreateRoom token={token} onCreated={handleCreated} />}
      <RoomList token={token} />
    </main>
  );
};
