import React from 'react';

function TypingIndicator({ typingUsers }) {
  return (
    <div className="typing-indicator">
      {typingUsers.length > 0 && (
        <p>
          {typingUsers.length === 1
            ? `${typingUsers[0]} is typing...`
            : `${typingUsers.join(', ')} are typing...`}
        </p>
      )}
    </div>
  );
}

export default TypingIndicator;
