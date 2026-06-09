import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  provider: z.enum(["github", "google"]),
  providerId: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;
