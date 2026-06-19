import type { PresenceUser } from "@stalk-talk/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.js";

type Props = { users: PresenceUser[] };

export const PresenceList = ({ users }: Props) => {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1 font-medium">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        {users.length} online
      </span>
      <div className="flex -space-x-2">
        {users.map((u) => (
          <Avatar key={u.id} className="h-6 w-6 border-2 border-background">
            {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.username} />}
            <AvatarFallback className="text-[10px]">{u.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="flex gap-2">
        {users.map((u) => (
          <span key={u.id}>{u.username}</span>
        ))}
      </span>
    </div>
  );
};
