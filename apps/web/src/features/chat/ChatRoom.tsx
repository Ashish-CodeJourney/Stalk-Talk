import { useState } from "react";
import { Send } from "lucide-react";
import { useAuthContext } from "../auth/AuthContext.js";
import { useSocket } from "./useSocket.js";
import { useMessages } from "./useMessages.js";
import { useMessageHistory } from "./useMessageHistory.js";
import { useCombinedMessages } from "./useCombinedMessages.js";
import { useTyping } from "./useTyping.js";
import { MessageList } from "./MessageList.js";
import { TypingIndicator } from "./TypingIndicator.js";
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
  const socket = useSocket(token);
  const userId = token ? decodeUserId(token) : undefined;
  const { messages: realtimeMessages, send } = useMessages(socket, roomId, userId);
  const { messages: historyMessages, hasNextPage, fetchNextPage, isFetching } = useMessageHistory(roomId, token);
  const messages = useCombinedMessages(historyMessages, realtimeMessages);
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
    <section className="mx-auto flex h-screen max-w-2xl flex-col">
      {hasNextPage && (
        <div className="flex justify-center p-2">
          <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetching}>
            {isFetching ? "Loading…" : "Load older messages"}
          </Button>
        </div>
      )}
      <MessageList messages={messages} currentUserId={userId ?? ""} />
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
