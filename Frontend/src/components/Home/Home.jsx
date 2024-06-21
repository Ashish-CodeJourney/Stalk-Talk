import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { motion } from 'framer-motion'; // Import motion from framer-motion for animations

function Home() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const handleJoinChat = () => {
    // Logic to handle joining the chat with the entered name and room number
    // For example, you can redirect to the chatroom using history.push
    history.push(`/Chatroom?name=${name}&room=${room}`);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center">
      <motion.img
        src={logo}
        alt="Logo"
        className="h-40 w-40 mb-4"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      />
      <div className="max-w-md bg-white p-8 rounded shadow-lg">
        <motion.div
          className="typewriter-text text-3xl font-bold mb-4 overflow-hidden"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="animate-typewriter">Welcome to Stalk-Talk</div>
        </motion.div>
        <p className="text-gray-700 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
          Join the conversation and connect with others!
        </p>
        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Room Name/Number"
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:border-blue-500"
          />
        </div>
        <Link to={`/Chatroom?name=${name}&room=${room}`}>
          <motion.button
            onClick={handleJoinChat}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Join Chat
          </motion.button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
