import { z } from "zod";
import { MessageSchema } from "./message.schema.js";

export const RoomJoinPayloadSchema = z.object({ roomId: z.string().min(1) });
export const RoomLeavePayloadSchema = z.object({ roomId: z.string().min(1) });
export const MessageSendPayloadSchema = z.object({
  roomId: z.string().min(1),
  text: z.string().min(1).max(2000),
});
export const TypingPayloadSchema = z.object({ roomId: z.string().min(1) });

export const MessageNewEventSchema = MessageSchema;
export const PresenceUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  avatarUrl: z.string().nullable(),
});
export const RoomUsersEventSchema = z.object({
  roomId: z.string().min(1),
  users: z.array(PresenceUserSchema),
});
export const TypingUpdateEventSchema = z.object({
  roomId: z.string().min(1),
  userId: z.string().min(1),
  isTyping: z.boolean(),
});
export const SocketErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

export type RoomJoinPayload = z.infer<typeof RoomJoinPayloadSchema>;
export type RoomLeavePayload = z.infer<typeof RoomLeavePayloadSchema>;
export type MessageSendPayload = z.infer<typeof MessageSendPayloadSchema>;
export type TypingPayload = z.infer<typeof TypingPayloadSchema>;
export type MessageNewEvent = z.infer<typeof MessageNewEventSchema>;
export type PresenceUser = z.infer<typeof PresenceUserSchema>;
export type RoomUsersEvent = z.infer<typeof RoomUsersEventSchema>;
export type TypingUpdateEvent = z.infer<typeof TypingUpdateEventSchema>;
export type SocketError = z.infer<typeof SocketErrorSchema>;
