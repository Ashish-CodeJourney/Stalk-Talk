import type { Message } from "@stalk-talk/types";

type Props = { messages: Message[]; currentUserId: string };

export const MessageList = ({ messages, currentUserId }: Props) => {
  if (messages.length === 0) return <p>No messages yet</p>;

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg.id} className={msg.userId === currentUserId ? "own" : "other"}>
          {msg.text}
        </li>
      ))}
    </ul>
  );
};
