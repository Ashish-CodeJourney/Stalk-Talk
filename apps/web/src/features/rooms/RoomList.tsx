import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchRooms } from "./room.api.js";

type Props = { token: string };

export const RoomList = ({ token }: Props) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => fetchRooms(token),
  });

  if (isLoading) return <p>Loading rooms…</p>;
  if (isError) return <p>Error loading rooms</p>;

  return (
    <ul>
      {data?.map((room) => (
        <li key={room.id}>
          <Link to={`/chat/${room.id}`}>{room.name}</Link>
        </li>
      ))}
    </ul>
  );
};
