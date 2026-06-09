type GitHubUser = {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
};

type FetchOptions = { code: string; clientId: string; clientSecret: string };

export const fetchGitHubUser = async ({ code, clientId, clientSecret }: FetchOptions): Promise<GitHubUser> => {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}`, Accept: "application/json" },
  });
  return userRes.json() as Promise<GitHubUser>;
};
