import { useState } from "react";
import { useAuthContext } from "../auth/AuthContext.js";
import { useSocket } from "./useSocket.js";
import { useMessages } from "./useMessages.js";
import { useTyping } from "./useTyping.js";
import { MessageList } from "./MessageList.js";
import { TypingIndicator } from "./TypingIndicator.js";

const decodeUserId = (token: string): string | undefined => {
  try {
    const payload = token.split(".")[1];
    return (JSON.parse(atob(payload!)) as { userId?: string }).userId;
  } catch { return undefined; }
};

type Props = { roomId: string };

export const ChatRoom = ({ roomId }: Props) => {
  const { token, isAuthenticated } = useAuthContext();
  const socket = useSocket(token);
  const userId = token ? decodeUserId(token) : undefined;
  const { messages, send } = useMessages(socket, roomId, userId);
  const { typingUserIds, notifyTyping } = useTyping(socket, roomId);
  const [text, setText] = useState("");

  if (!isAuthenticated) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    send(text.trim());
    setText("");
  };

  return (
    <section>
      <MessageList messages={messages} currentUserId={token ?? ""} />
      <TypingIndicator typingUserIds={typingUserIds} />
      <form onSubmit={handleSend}>
        <input
          value={text}
          onChange={(e) => { setText(e.target.value); notifyTyping(); }}
          placeholder="Type a message…"
        />
        <button type="submit" disabled={!text.trim()}>Send</button>
      </form>
    </section>
  );
};
