import React from "react";

export default function Input({ message, setMessage, sendMessage }) {
  return (
    <form className="flex flex-col sm:flex-row items-center p-4">
      <input
        className="border-2 border-gray-300 rounded-lg py-2 px-4 mb-2 sm:mb-0 sm:mr-2 focus:outline-none focus:border-blue-500"
        type="text"
        placeholder="Type a message...."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
        onClick={(e) => sendMessage(e)}
      >
        Send
      </button>
    </form>
  );
}
