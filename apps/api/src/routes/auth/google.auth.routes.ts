import type { FastifyInstance } from "fastify";
import type { AppOptions } from "../../app.js";
import { signAccessToken, signRefreshToken, hashToken } from "../../services/token.service.js";
import { fetchGoogleUser } from "../../services/google.service.js";

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const REFRESH_COOKIE = "refreshToken";

export const googleAuthRoutes = async (app: FastifyInstance, opts: Required<Omit<AppOptions, "rateLimit">>) => {
  const { prisma, jwtSecret, refreshSecret } = opts;

  const clientId = process.env["GOOGLE_CLIENT_ID"] ?? "dev-google-client-id";
  const clientSecret = process.env["GOOGLE_CLIENT_SECRET"] ?? "";
  const frontendUrl = process.env["FRONTEND_URL"] ?? "http://localhost:5173";
  const apiUrl = process.env["API_URL"] ?? "http://localhost:5000";
  const redirectUri = `${apiUrl}/auth/google/callback`;

  app.get("/auth/google", async (_req, reply) => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
    });
    return reply.redirect(`${GOOGLE_AUTHORIZE_URL}?${params}`);
  });

  app.get<{ Querystring: { code?: string } }>("/auth/google/callback", async (req, reply) => {
    const { code } = req.query;
    if (!code) return reply.status(400).send({ error: "Missing code" });

    const googleUser = await fetchGoogleUser({ code, clientId, clientSecret, redirectUri });

    const username = googleUser.email.split("@")[0]!.replace(/[^a-z0-9]/gi, "_");
    const user = await prisma.user.upsert({
      where: { provider_providerId: { provider: "google", providerId: googleUser.sub } },
      update: { email: googleUser.email, avatarUrl: googleUser.picture },
      create: {
        email: googleUser.email,
        username,
        avatarUrl: googleUser.picture,
        provider: "google",
        providerId: googleUser.sub,
      },
    });

    const accessToken = signAccessToken({ userId: user.id, secret: jwtSecret });
    const refreshToken = signRefreshToken({ userId: user.id, secret: refreshSecret });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: await hashToken(refreshToken) } });

    reply.setCookie(REFRESH_COOKIE, refreshToken, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    return reply.redirect(`${frontendUrl}?token=${accessToken}`);
  });
};
