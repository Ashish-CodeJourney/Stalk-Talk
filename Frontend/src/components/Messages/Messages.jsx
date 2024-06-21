import React from "react";
import { motion } from "framer-motion";

export default function Messages({ messages, name }) {
  return (
    <div className="space-y-2">
      {messages.map((message, i) => (
        <motion.div
          key={i}
          className={`flex items-center p-2 rounded-lg max-w-lg ${
            message.user === name ? "bg-blue-600 text-white ml-auto" : "bg-gray-700 text-gray-200 mr-auto"
          }`}
          initial={{ x: message.user === name ? 100 : -100 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <p className="text-sm">{message.text}</p>
        </motion.div>
      ))}
    </div>
  );
}
