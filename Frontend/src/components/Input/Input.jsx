import React from "react";

export default function Input({ message, setMessage, sendMessage }) {
  return (
    <form className="flex mt-4" onSubmit={sendMessage}>
      <input
        className="flex-1 p-2 rounded-l-lg bg-gray-800 text-white outline-none focus:ring-2 focus:ring-purple-600"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button
        className="p-2 bg-purple-600 rounded-r-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-600"
        type="submit"
      >
        Send
      </button>
    </form>
  );
}
