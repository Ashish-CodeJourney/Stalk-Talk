import { useParams } from "react-router-dom";
import { ChatRoom } from "./ChatRoom.js";

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  if (!roomId) return null;
  return <ChatRoom roomId={roomId} />;
};
