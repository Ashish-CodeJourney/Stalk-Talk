import type { FastifyInstance } from "fastify";
import type { AppOptions } from "../../app.js";
import { signAccessToken, signRefreshToken, hashToken, verifyTokenHash, verifyAccessToken } from "../../services/token.service.js";
import { fetchGitHubUser } from "../../services/github.service.js";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const REFRESH_COOKIE = "refreshToken";

export const authRoutes = async (app: FastifyInstance, opts: AppOptions) => {
  const { prisma, jwtSecret, refreshSecret } = opts;

  const clientId = process.env["GITHUB_CLIENT_ID"] ?? "dev-client-id";
  const clientSecret = process.env["GITHUB_CLIENT_SECRET"] ?? "";
  const frontendUrl = process.env["FRONTEND_URL"] ?? "http://localhost:5173";

  app.get("/auth/github", async (_req, reply) => {
    const url = `${GITHUB_AUTHORIZE_URL}?client_id=${clientId}&scope=user:email`;
    return reply.redirect(url);
  });

  app.get<{ Querystring: { code?: string } }>("/auth/github/callback", async (req, reply) => {
    const { code } = req.query;
    if (!code) return reply.status(400).send({ error: "Missing code" });

    const githubUser = await fetchGitHubUser({ code, clientId, clientSecret });

    const user = await prisma.user.upsert({
      where: { provider_providerId: { provider: "github", providerId: String(githubUser.id) } },
      update: { email: githubUser.email, avatarUrl: githubUser.avatar_url },
      create: {
        email: githubUser.email,
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        provider: "github",
        providerId: String(githubUser.id),
      },
    });

    const accessToken = signAccessToken({ userId: user.id, secret: jwtSecret });
    const refreshToken = signRefreshToken({ userId: user.id, secret: refreshSecret });
    const hashedRefresh = await hashToken(refreshToken);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });

    reply.setCookie(REFRESH_COOKIE, refreshToken, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    return reply.redirect(`${frontendUrl}?token=${accessToken}`);
  });

  app.post("/auth/refresh", async (req, reply) => {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) return reply.status(401).send({ error: "No refresh token" });

    let userId: string;
    try {
      ({ userId } = verifyAccessToken({ token, secret: refreshSecret }));
    } catch {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken) return reply.status(401).send({ error: "Token revoked" });

    const valid = await verifyTokenHash(token, user.refreshToken);
    if (!valid) return reply.status(401).send({ error: "Token mismatch" });

    const accessToken = signAccessToken({ userId, secret: jwtSecret });
    const newRefresh = signRefreshToken({ userId, secret: refreshSecret });
    const hashed = await hashToken(newRefresh);
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: hashed } });

    reply.setCookie(REFRESH_COOKIE, newRefresh, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    return { accessToken };
  });

  app.delete("/auth/logout", async (_req, reply) => {
    reply.clearCookie(REFRESH_COOKIE, { path: "/" });
    return reply.status(204).send();
  });
};
