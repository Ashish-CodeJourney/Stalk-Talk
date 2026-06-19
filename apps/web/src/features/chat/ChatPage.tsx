import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useAuthContext } from "../auth/AuthContext.js";
import { RoomList } from "../rooms/RoomList.js";
import { CreateRoom } from "../rooms/CreateRoom.js";
import { Button } from "@/components/ui/button.js";
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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rooms</h1>
        <Button variant="outline" size="sm" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "Cancel" : "New room"}
        </Button>
      </div>
      {showCreate && <CreateRoom token={token} onCreated={handleCreated} />}
      <RoomList token={token} />
    </main>
  );
};
