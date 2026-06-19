import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Send, ArrowLeft, LogOut } from "lucide-react";
import { useAuthContext } from "../auth/AuthContext.js";
import { useRoomMembership } from "../rooms/useRoomMembership.js";
import { useSocket } from "./useSocket.js";
import { useMessages } from "./useMessages.js";
import { useMessageHistory } from "./useMessageHistory.js";
import { useCombinedMessages } from "./useCombinedMessages.js";
import { useTyping } from "./useTyping.js";
import { usePresence } from "./usePresence.js";
import { MessageList } from "./MessageList.js";
import { TypingIndicator } from "./TypingIndicator.js";
import { PresenceList } from "./PresenceList.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";

const decodeUserId = (token: string): string | undefined => {
  try {
    const payload = token.split(".")[1];
    return (JSON.parse(atob(payload!)) as { userId?: string }).userId;
  } catch { return undefined; }
};

type Props = { roomId: string };

export const ChatRoom = ({ roomId }: Props) => {
  const { token, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const socket = useSocket(token);
  const userId = token ? decodeUserId(token) : undefined;
  const { messages: realtimeMessages, send, edit, remove, react } = useMessages(socket, roomId, userId);
  const { messages: historyMessages, hasNextPage, fetchNextPage, isFetching } = useMessageHistory(roomId, token);
  const messages = useCombinedMessages(historyMessages, realtimeMessages);
  const { typingUserIds, notifyTyping } = useTyping(socket, roomId);
  const presentUsers = usePresence(socket);
  const { leave } = useRoomMembership(token, roomId);
  const [text, setText] = useState("");

  if (!isAuthenticated) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    send(text.trim());
    setText("");
  };

  const handleLeave = async () => {
    await leave();
    navigate("/chat");
  };

  return (
    <section className="mx-auto flex h-screen max-w-2xl flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/chat">
            <ArrowLeft className="h-4 w-4" />
            Rooms
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLeave}>
          <LogOut className="h-4 w-4" />
          Leave room
        </Button>
      </div>
      <PresenceList users={presentUsers} />
      {hasNextPage && (
        <div className="flex justify-center p-2">
          <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetching}>
            {isFetching ? "Loading…" : "Load older messages"}
          </Button>
        </div>
      )}
      <MessageList messages={messages} currentUserId={userId ?? ""} onEdit={edit} onDelete={remove} onReact={react} />
      <TypingIndicator typingUserIds={typingUserIds} />
      <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-4">
        <Input
          value={text}
          onChange={(e) => { setText(e.target.value); notifyTyping(); }}
          placeholder="Type a message…"
        />
        <Button type="submit" disabled={!text.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
};
