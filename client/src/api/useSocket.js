import { io } from "socket.io-client";
const HOST_SERVER = "http://localhost:3010";

export const socketInstance = io(HOST_SERVER);
