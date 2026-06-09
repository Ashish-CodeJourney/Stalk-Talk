import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

type SignOptions = { userId: string; secret: string };
type VerifyOptions = { token: string; secret: string };
type JwtPayload = { userId: string };

export const signAccessToken = ({ userId, secret }: SignOptions): string =>
  jwt.sign({ userId } satisfies JwtPayload, secret, { expiresIn: ACCESS_TOKEN_TTL });

export const signRefreshToken = ({ userId, secret }: SignOptions): string =>
  jwt.sign({ userId } satisfies JwtPayload, secret, { expiresIn: REFRESH_TOKEN_TTL });

export const verifyAccessToken = ({ token, secret }: VerifyOptions): JwtPayload => {
  const payload = jwt.verify(token, secret);
  if (typeof payload === "string" || !("userId" in payload)) {
    throw new Error("Invalid token payload");
  }
  return { userId: payload["userId"] as string };
};

export const hashToken = (token: string): Promise<string> => bcrypt.hash(token, 10);

export const verifyTokenHash = (token: string, hash: string): Promise<boolean> =>
  bcrypt.compare(token, hash);
