// src/socket.js

import io from 'socket.io-client';

const ENDPOINT = 'https://stalk-talk.onrender.com'; // added backend url
// const ENDPOINT = 'http://localhost:5001'; // Updated to match the backend port

const socket = io(ENDPOINT);

export { socket, ENDPOINT };
