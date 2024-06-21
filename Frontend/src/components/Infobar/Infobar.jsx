import React from "react";
import { motion } from "framer-motion";

export default function Infobar({ room }) {
  return (
    <motion.div
      className="flex items-center justify-between p-4 bg-gray-800 rounded-t-lg shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      <h3 className="text-lg font-semibold">Room: {room}</h3>
      <div className="flex items-center">
        <span className="inline-block w-3 h-3 mr-2 bg-green-400 rounded-full"></span>
        <span>Online</span>
      </div>
    </motion.div>
  );
}
