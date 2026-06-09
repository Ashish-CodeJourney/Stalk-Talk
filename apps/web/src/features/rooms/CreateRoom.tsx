import { useState } from "react";
import type { Room } from "@stalk-talk/types";
import { createRoom } from "./room.api.js";

type Props = { token: string; onCreated: (room: Room) => void };

export const CreateRoom = ({ token, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const room = await createRoom(token, name.trim());
      onCreated(room);
      setName("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room name" />
      {error && <p>{error}</p>}
      <button type="submit" disabled={submitting}>
        Create room
      </button>
    </form>
  );
};
