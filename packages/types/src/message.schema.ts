import { z } from "zod";

export const MessageSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(2000),
  userId: z.string().min(1),
  roomId: z.string().min(1),
  createdAt: z.string().datetime(),
  editedAt: z.string().datetime().nullable().optional(),
  deletedAt: z.string().datetime().nullable().optional(),
});

export type Message = z.infer<typeof MessageSchema>;
