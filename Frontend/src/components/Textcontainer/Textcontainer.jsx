import React from 'react';
import onlineIcon from '../../assets/onlineIcon.png';

const TextContainer = ({ users }) => {
  return (
    <div className="flex flex-col justify-center items-center text-white p-4 bg-blue-500 rounded-lg shadow-md">
      <div>
        <h1 className="text-3xl font-bold mb-2">Stalk-talk<span role="img" aria-label="emoji">💬</span></h1>
        <h2 className="text-lg mb-2">Incase noone told you, you're important<span role="img" aria-label="emoji">❤️</span></h2>
        <h2 className="text-lg">Feel free to express<span role="img" aria-label="emoji">✨</span></h2>
      </div>
      {users ? (
        <div className="max-h-48 overflow-y-auto mt-4">
          <h1 className="text-xl mb-2">People currently chatting:</h1>
          <div className="flex flex-col items-start">
            {users.map(({ name }) => (
              <div key={name} className="flex items-center mb-2">
                <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center overflow-hidden mr-2">
                  <img alt="Online Icon" src={onlineIcon} className="h-full w-full object-cover" />
                </div>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-lg mt-4">Users are not showing</div>
      )}
    </div>
  );
};

export default TextContainer;
