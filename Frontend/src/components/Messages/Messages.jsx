import React from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import Message from "../Message/Message";

export default function Messages({ messages, name }) {
  return (
    <ScrollToBottom className="flex-1 overflow-y-auto">
      {messages &&
        messages.map((message, i) => (
          <div
            key={i}
            className={`mb-2 ${
              message.user === name ? "justify-end" : "justify-start"
            }`}
          >
            <Message message={message} name={name} />
          </div>
        ))}
    </ScrollToBottom>
  );
}
