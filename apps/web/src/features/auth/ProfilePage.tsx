import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "./AuthContext.js";
import { fetchMe } from "./user.api.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.js";
import { Card, CardContent } from "@/components/ui/card.js";

export const ProfilePage = () => {
  const { token } = useAuthContext();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe(token!),
    enabled: token !== null,
  });

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  if (isError) return <p className="p-6 text-sm text-destructive">Failed to load profile</p>;

  return (
    <Card className="mx-auto mt-12 w-full max-w-sm">
      <CardContent className="flex flex-col items-center gap-3 pt-6">
        <Avatar className="h-16 w-16">
          {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.username} />}
          <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <p className="text-lg font-semibold">{user?.username}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </CardContent>
    </Card>
  );
};
