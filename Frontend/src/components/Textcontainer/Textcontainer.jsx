import React from "react";

export default function Textcontainer({ users }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Users in room:</h2>
      <ul className="space-y-1">
        {Array.isArray(users) && users.map((user, i) => (
          <li key={i} className="flex items-center">
            <span className="inline-block w-2 h-2 mr-2 bg-green-400 rounded-full"></span>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
