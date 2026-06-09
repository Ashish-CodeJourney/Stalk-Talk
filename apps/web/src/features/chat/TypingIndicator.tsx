type Props = { typingUserIds: string[] };

export const TypingIndicator = ({ typingUserIds }: Props) => {
  if (typingUserIds.length === 0) return null;
  const count = typingUserIds.length;
  return <p>{count === 1 ? "Someone is typing…" : `${count} people are typing…`}</p>;
};
