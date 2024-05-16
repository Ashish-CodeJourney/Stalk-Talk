const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const { addUser, removeUser, getUser, getUserInRoom } = require("./users.js");

const PORT = process.env.PORT || 3000; // Changed port to 5001

const router = require("./router");
const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketio(server, {
  cors: {
    origin: "https://stalktalk.ashishcodejourney.tech/", // Adjust this to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection logic
io.on("connection", (socket) => {
  console.log('New connection established');
  
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, Welcome to room ${user.room}`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", { user: user.name, text: message });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
    }
  });
});

// Middleware
app.use(cors());
app.use(router);

// Start the server
server.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
