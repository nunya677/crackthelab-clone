import { io, Socket } from "socket.io-client";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const SOCKET_URL = API_URL.replace(/\/api$/, "");

let socket: Socket | null = null;

export function connectSocket(token: string | null) {
  socket?.disconnect();

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
    auth: token ? { token } : {},
  });

  return socket;
}

export function getSocket() {
  return socket;
}