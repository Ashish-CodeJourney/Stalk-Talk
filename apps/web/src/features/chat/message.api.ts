import axios from "axios";
import type { Message } from "@stalk-talk/types";

const API = import.meta.env["VITE_API_URL"] ?? "http://localhost:5000";

type MessagePage = { data: Message[]; nextCursor: string | undefined };

export const fetchMessages = (
  token: string,
  roomId: string,
  cursor?: string
): Promise<MessagePage> =>
  axios
    .get(`${API}/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
      params: cursor ? { cursor } : {},
    })
    .then((r) => r.data as MessagePage);
