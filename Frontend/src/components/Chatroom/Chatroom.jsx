import React, { useState, useEffect } from "react";
import queryString from "query-string";
import { useLocation } from "react-router";
import io from "socket.io-client";
import Infobar from "../Infobar/Infobar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";
import Textcontainer from "../Textcontainer/Textcontainer";
import TypingIndicator from "../Typingindicator/Typingindicator"; 
import { ENDPOINT } from "../socket";
import { motion } from "framer-motion";

let socket;

export default function Chatroom() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]); // State for typing users
  const location = useLocation();

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT, {
      transports: ["websocket", "polling", "flashsocket"],
    });
    setName(name);
    setRoom(room);

    socket.emit("join", { name, room }, () => {});

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [location.search]);

  useEffect(() => {
    socket.once("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });
    socket.on("roomData", ({ users, typingUsers }) => {
      setUsers(users || []);
      setTypingUsers(typingUsers || []); // Update typing users
    });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-gradient-to-r from-purple-500 to-blue-500 text-white">
      <div className="w-full sm:w-1/4 bg-gradient-to-b from-gray-800 to-gray-900 p-4">
        <Textcontainer users={users} />
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <Infobar room={room} />
        <motion.div
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Messages messages={messages} name={name} />
          <TypingIndicator typingUsers={typingUsers} /> {/* Render TypingIndicator */}
        </motion.div>
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
