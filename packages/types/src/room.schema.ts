import { z } from "zod";

export const RoomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  createdAt: z.string().datetime(),
});

export type Room = z.infer<typeof RoomSchema>;
