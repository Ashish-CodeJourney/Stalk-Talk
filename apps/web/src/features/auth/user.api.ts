import axios from "axios";
import type { User } from "@stalk-talk/types";

const API = import.meta.env["VITE_API_URL"] ?? "http://localhost:5000";

export const fetchMe = (token: string): Promise<User> =>
  axios.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data as User);
