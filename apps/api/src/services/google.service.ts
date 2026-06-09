type GoogleUser = {
  sub: string;
  email: string;
  name: string;
  picture: string;
};

type FetchOptions = { code: string; clientId: string; clientSecret: string; redirectUri: string };

export const fetchGoogleUser = async ({ code, clientId, clientSecret, redirectUri }: FetchOptions): Promise<GoogleUser> => {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  return userRes.json() as Promise<GoogleUser>;
};
