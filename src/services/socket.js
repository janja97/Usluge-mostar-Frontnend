import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  // token: "Bearer <jwt>" or just the raw token — server strips 'Bearer ' if present
  socket = io(process.env.VUE_APP_API_URL || "http://localhost:5000", {
    auth: {
      token
    }
  });

  socket.on('connect', () => {
    console.log('Socket connected', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error', err.message);
  });

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};
