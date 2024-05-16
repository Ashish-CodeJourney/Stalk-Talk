const users = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.name === name && user.room === room
  );
  if (existingUser) return { error: "Username is taken" };

  const user = { id, name, room, typing: false }; // Add typing status to the user object
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUserInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

const setUserTyping = (id, typing) => {
  const user = getUser(id);
  if (user) {
    user.typing = typing;
  }
};

module.exports = { addUser, removeUser, getUser, getUserInRoom, setUserTyping };
