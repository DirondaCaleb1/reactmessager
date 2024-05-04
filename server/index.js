import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { customAlphabet } from "nanoid";
import CheckRouter from "./routers/CheckRoute.js";
import CheckUsersRouter from "./routers/CheckUsersRoute.js";
import AuthRouter from "./routers/AuthRoute.js";
import UserRouter from "./routers/UserRoute.js";
import MesssageRouter from "./routers/MessageRoute.js";
import CallRouter from "./routers/CallRoute.js";

const nanoid = customAlphabet("1234567890abcdef", 6);
const PORT = process.env.PORT || 3010;

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
app.use(morgan("common"));
app.use(express.json());
app.use(helmet());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/api/check", CheckRouter);

app.use("/api/checkuser", CheckUsersRouter);

app.use("/api/auth", AuthRouter);

app.use("/uploads/images/profiles", express.static("uploads/images/profiles/"));

app.use("/uploads/recordings", express.static("uploads/recordings/"));

app.use(
  "/uploads/recordings/audio",
  express.static("uploads/recordings/audio/")
);

app.use(
  "/uploads/recordings/video",
  express.static("uploads/recordings/video/")
);

app.use(
  "/uploads/recordings/documents",
  express.static("uploads/recordings/documents/")
);

app.use("/uploads/images", express.static("uploads/images/"));

app.use(
  "/uploads/recordings/others",
  express.static("uploads/recordings/others/")
);

app.use("/api/user", UserRouter);

app.use("/api/messages", MesssageRouter);

app.use("/api/calls", CallRouter);

app.get("/", (_req, res) => {
  res.send("Bienvenue");
});

const server = app.listen(PORT, () => {
  console.log("Le serveur de developpement est en route avec succès");
});

//io.on("connection", (socket) => {

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

global.onlineUsers = new Map();
global.usersConected = new Map();
global.inComingVoiceCall = new Map();
global.inComingVideoCall = new Map();
global.arrayInComingVoiceCall = [];
global.callUsersExists = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  let id = nanoid();

  //Creating the chat room (add-user equivalent)
  socket.on("create-room", () => {
    console.log(id);
    //Sending the room ID to the host (client)
    socket.emit("me", id);
    socket.join(id);
    socket.emit("created");
  });

  socket.on("join-room", (id) => {
    console.log(id);
    const { rooms } = io.sockets.adapter;
    const room = rooms.get(id);

    console.log(room);

    //Checking if the room existing
    if (room === undefined) {
      socket.emit("not-existing");
    } else if (room.size === 1) {
      //Joining the other user to the room that contains only the host
      socket.join(id);
      socket.broadcast.to(id).emit("ready", id);
    } else {
      //Returns an Error since they are already two in the room
      socket.emit("full");
    }
  });

  //Chat Socket
  socket.on("add-user", (userId) => {
    //console.log(userId);
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("auth-online-offline", (userId, statusOnline) => {
    /*console.log({
      userId: userId,
      statusOnline: statusOnline,
    });*/

    if (typeof statusOnline !== "undefined" && statusOnline === true) {
      usersConected.set(userId, socket.id);
    } else if (typeof statusOnline !== "undefined" && statusOnline === false) {
      usersConected.delete(userId);
    }
    socket.broadcast.emit("users-online", {
      connectUsers: Array.from(usersConected.keys()),
    });
  });

  socket.on("signout", (id) => {
    //console.log(id);
    onlineUsers.delete(id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("send-msg", (data) => {
    const senderUserSocket = onlineUsers.get(data.to);
    const userSocketSender = usersConected.get(data.to);
    if (senderUserSocket) {
      socket.to(senderUserSocket).emit("msg-recieve", {
        from: data.from,
        message: data.message,
      });
    }
  });

  socket.on("writting-status", (data) => {
    const senderUserSocket = onlineUsers.get(data.to);
    const userSocketSender = usersConected.get(data.to);
    if (senderUserSocket) {
      socket.to(senderUserSocket).emit("receive-writing-status", {
        message: data.message,
        profilePicture: data.profilePicture,
      });
    }
  });

  socket.on("finish-writting-status", (data) => {
    const senderUserSocket = onlineUsers.get(data.to);
    const userSocketSender = usersConected.get(data.to);
    if (senderUserSocket) {
      socket.to(senderUserSocket).emit("finishing-writting-status");
    }
  });

  socket.on("update-unread-messages", (data) => {
    const senderUserSocket = onlineUsers.get(data.to);
    const userSocketSender = usersConected.get(data.to);
    if (senderUserSocket) {
      socket.to(senderUserSocket).emit("unread-messages-view");
    }
  });

  /* Call Evenment */
  /* Listen the evenment "outgoing-voice-call" */
  socket.on("outgoing-voice-call", (data) => {
    const senderUserSocket = onlineUsers.get(data.to);
    const userSocketSender = usersConected.get(data.to);

    if (senderUserSocket) {
      /* Emit the evenment "incoming-voice-call" to start the call application from another user (senderUserSocket) */
      socket.to(senderUserSocket).emit("incoming-voice-call", {
        from: data.from,
        callType: data.callType,
      });
    }
  });

  /* Listen the evenment "outgoing-video-call" */
  socket.on("outgoing-video-call", (data) => {
    const senderUserSocket = onlineUsers.get(data.to);
    const userSocketSender = usersConected.get(data.to);
    if (senderUserSocket) {
      /* Emit the evenment "incoming-video-call" to start the call application from another user (senderUserSocket) */
      socket.to(senderUserSocket).emit("incoming-video-call", {
        from: data.from,
        callType: data.callType,
      });
    }
  });

  /* Listen the evenment "reject-voice-call" */
  socket.on("reject-voice-call", (data) => {
    const senderUserSocket = onlineUsers.get(data.from);
    const userSocketSender = usersConected.get(data.from);
    if (senderUserSocket) {
      /* Emit the evenment "voice-call-rejected" to reject the call application from another user (senderUserSocket) */
      socket.to(senderUserSocket).emit("voice-call-rejected");

      socket.to(senderUserSocket).emit("voice-call-rejected-byerror");
    }
  });

  /* Listen the evenment "reject-video-call" */
  socket.on("reject-video-call", (data) => {
    const senderUserSocket = onlineUsers.get(data.from);
    const userSocketSender = usersConected.get(data.from);
    if (senderUserSocket) {
      /* Emit the evenment "video-call-rejected" to reject the call application from another user (senderUserSocket) */
      socket.to(senderUserSocket).emit("video-call-rejected");

      socket.to(senderUserSocket).emit("video-call-rejected-byerror");
    }
  });

  /* Listen the evenment "accept-incoming-call" for all types call */
  socket.on("accept-incoming-call", ({ id, to, callType }) => {
    /*console.log({
      id: id,
      to: to,
    });*/
    const senderUserSocket = onlineUsers.get(id);
    const userSocketSender = usersConected.get(id);
    /* Emit the evenment "accept-call" to accept the call application from another user (senderUserSocket) */
    socket.to(senderUserSocket).emit("accept-call");

    /* Emit the evenment "open-local-stream" to open the stream of the call application from another user (senderUserSocket)  */
    //socket.to(senderUserSocket).emit("open-local-stream", callType);

    socket.to(senderUserSocket).emit("handle-offer", {
      from: id,
      to: to,
      callType: callType,
    });
  });

  socket.on("emit-call", (data) => {
    //console.log(data);

    callUsersExists.set(data.from, data.id);

    const emitCallUser = Array.from(callUsersExists.keys());
    const recieveCallUser = Array.from(callUsersExists.values());

    socket.broadcast.emit(
      "receive-call",
      data.id,
      data.from,
      emitCallUser,
      recieveCallUser
    );
  });

  socket.on("emit-init-call", (data) => {
    console.log(data);

    if (callUsersExists.has(data.from)) {
      callUsersExists.delete(data.from);
    }

    const emitCallUser = Array.from(callUsersExists.keys());
    const recieveCallUser = Array.from(callUsersExists.values());

    socket.broadcast.emit("init-call-id", emitCallUser, recieveCallUser);
  });

  socket.on("call-responsive-exists", (data) => {
    console.log(data);
    socket.broadcast.emit("user-handler", data.from);
  });

  socket.on("offer", (offer, roomId, callType, idReceive) => {
    console.log("offer", roomId);

    const senderUserSocket = onlineUsers.get(roomId);
    const userSocketSender = usersConected.get(roomId);

    socket.to(senderUserSocket).emit("open-peer-stream", callType);

    socket.to(senderUserSocket).emit("offer", offer, idReceive);
  });

  //Once we get an answer from the user, we will send it to the host
  socket.on("answer", (answer, idReceive) => {
    console.log("answer", idReceive);

    const senderUserSocket = onlineUsers.get(idReceive);
    const userSocketSender = usersConected.get(idReceive);

    socket.broadcast.to(senderUserSocket).emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate, roomId) => {
    console.log("icecandidate", roomId);

    const senderUserSocket = onlineUsers.get(roomId);

    const userSocketSender = usersConected.get(roomId);

    socket.to(senderUserSocket).emit("ice-candidate", candidate);
  });

  socket.on("send-history-call", (data) => {
    const senderUserSocket = onlineUsers.get(data.to);
    const userSocketSender = usersConected.get(data.to);
    //console.log(data);
    if (senderUserSocket) {
      socket.to(senderUserSocket).emit("history-call-recieve", {
        from: data.from,
        historyCall: data.historyCall,
      });
    }
  });

  /* Listen the evenment "outgoing-voice-call" */
  socket.on("outgoing-id-call", (data) => {
    const senderUserSocket = onlineUsers.get(data.to);
    const userSocketSender = usersConected.get(data.to);

    if (senderUserSocket) {
      /* Emit the evenment "incoming-voice-call" to start the call application from another user (senderUserSocket) */
      socket.to(senderUserSocket).emit("incoming-id-call", {
        idCall: data.idCall,
      });
    }
  });

  //Once we get the offer from the host, we will send it to the other user
  /*socket.on("offer", (offer, roomId) => {
    console.log("offer", roomId);
    socket.broadcast.to(roomId).emit("offer", offer, roomId);
  });*/

  //Once we get an icecandidate from the user, we will send it to the other user
  /*socket.on("ice-candidate", (candidate, roomId) => {
    console.log("icecandidate", roomId);
    socket.broadcast.to(roomId).emit("ice-candidate", candidate);
  });*/
});
