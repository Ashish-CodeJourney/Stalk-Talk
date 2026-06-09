import axios from "axios";
import type { Room } from "@stalk-talk/types";

const API = import.meta.env["VITE_API_URL"] ?? "http://localhost:5000";

const authed = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export const fetchRooms = (token: string): Promise<Room[]> =>
  axios.get(`${API}/rooms`, authed(token)).then((r) => r.data as Room[]);

export const createRoom = (token: string, name: string): Promise<Room> =>
  axios.post(`${API}/rooms`, { name }, authed(token)).then((r) => r.data as Room);
