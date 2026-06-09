import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "./AuthContext.js";
import { fetchMe } from "./user.api.js";

export const ProfilePage = () => {
  const { token } = useAuthContext();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe(token!),
    enabled: token !== null,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load profile</p>;

  return (
    <div>
      {user?.avatarUrl && <img src={user.avatarUrl} alt={user.username} />}
      <p>{user?.username}</p>
      <p>{user?.email}</p>
    </div>
  );
};
