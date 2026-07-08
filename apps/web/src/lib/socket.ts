import { io, Socket } from "socket.io-client";

// API base from Vite env
const API_URL = import.meta.env.VITE_API_URL;

// Socket.io must connect to the root domain, not /api
const SOCKET_URL = API_URL.replace(/\/api$/, "");

// The active socket instance
let socket: Socket | null = null;

// Connect with optional auth token
export function connectSocket(token: string | null) {
  // Disconnect previous socket if any
  socket?.disconnect();

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
    auth: token ? { token } : {},
  });

  return socket;
}

// Retrieve the active socket
export function getSocket() {
  return socket;
}
