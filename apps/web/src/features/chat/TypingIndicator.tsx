type Props = { typingUserIds: string[] };

export const TypingIndicator = ({ typingUserIds }: Props) => {
  if (typingUserIds.length === 0) return null;
  const count = typingUserIds.length;
  return (
    <p className="px-4 pb-1 text-xs italic text-muted-foreground">
      {count === 1 ? "Someone is typing…" : `${count} people are typing…`}
    </p>
  );
};
