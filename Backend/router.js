const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { addUser, removeUser, getUser, getUserInRoom, setUserTyping } = require("./users");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://stalktalk.ashishcodejourney.tech/", // Adjust this to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Define a route to check if the server is running
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

// Socket.IO event for when a client connects
io.on("connection", (socket) => {
  console.log("A user connected");

  // Event for user joining a room
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", { user: "admin", text: `${user.name}, welcome to room ${user.room}` });
    socket.broadcast.to(user.room).emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.to(user.room).emit("roomData", { room: user.room, users: getUserInRoom(user.room) });

    callback();
  });

  // Event for when a user starts typing
  socket.on("typing", () => {
    setUserTyping(socket.id, true);
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit("typing", { userId: socket.id });
    }
  });

  // Event for when a user stops typing
  socket.on("stopTyping", () => {
    setUserTyping(socket.id, false);
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit("stopTyping", { userId: socket.id });
    }
  });

  // Event for when a user sends a message
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", { user: user.name, text: message });
      io.to(user.room).emit("roomData", { room: user.room, users: getUserInRoom(user.room) });
    }
    callback();
  });

  // Event for when a client disconnects
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", { user: "admin", text: `${user.name} has left.` });
      io.to(user.room).emit("roomData", { room: user.room, users: getUserInRoom(user.room) });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export the Express app if needed
