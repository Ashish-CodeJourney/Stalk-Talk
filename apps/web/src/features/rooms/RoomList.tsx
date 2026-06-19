import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { fetchRooms } from "./room.api.js";

type Props = { token: string };

export const RoomList = ({ token }: Props) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => fetchRooms(token),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading rooms…</p>;
  if (isError) return <p className="text-sm text-destructive">Error loading rooms</p>;

  return (
    <ul className="flex flex-col gap-2">
      {data?.map((room) => (
        <li key={room.id}>
          <Link
            to={`/chat/${room.id}`}
            className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            {room.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};
