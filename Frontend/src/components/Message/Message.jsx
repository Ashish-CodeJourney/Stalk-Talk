import React from "react";
import ReactEmoji from "react-emoji";

const Message = ({ message: { user, text }, name }) => {
  const isSentByCurrentUser =
    user.trim().toLowerCase() === name.trim().toLowerCase();

  return (
    <div
      className={`flex ${
        isSentByCurrentUser ? "justify-end" : "items-center"
      } mb-2`}
    >
      {!isSentByCurrentUser && <p className="text-sm pr-2">{user}</p>}
      <div
        className={`bg-${
          isSentByCurrentUser ? "blue" : "gray"
        }-500 rounded-lg px-4 py-2 max-w-md`}
      >
        <p className={`text-${isSentByCurrentUser ? "white" : "gray-800"}`}>
          {ReactEmoji.emojify(text)}
        </p>
      </div>
    </div>
  );
};

export default Message;
