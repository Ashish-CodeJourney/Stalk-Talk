import type { Message } from "@stalk-talk/types";
import { cn } from "@/lib/utils.js";

type Props = { messages: Message[]; currentUserId: string };

export const MessageList = ({ messages, currentUserId }: Props) => {
  if (messages.length === 0) return <p className="text-sm text-muted-foreground">No messages yet</p>;

  return (
    <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
      {messages.map((msg) => {
        const isOwn = msg.userId === currentUserId;
        return (
          <li
            key={msg.id}
            className={cn(
              "max-w-[75%] rounded-lg px-3 py-2 text-sm",
              isOwn ? "own self-end bg-primary text-primary-foreground" : "other self-start bg-secondary text-secondary-foreground"
            )}
          >
            {msg.text}
          </li>
        );
      })}
    </ul>
  );
};
