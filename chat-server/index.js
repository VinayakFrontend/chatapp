const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When the client sets the user name
  socket.on('set_user_name', (name) => {
    socket.userName = name; // Store the user's name
  });

  // Handle receiving messages
  socket.on('send_message', (data) => {
    io.emit('receive_message', data); // Broadcast message to all users
  });

  // Handle typing notifications
  socket.on('user_typing', (userName) => {
    socket.broadcast.emit('user_typing', userName); // Notify others that a user is typing
  });

  // Handle user leaving
  socket.on('disconnect', () => {
    if (socket.userName) {
      io.emit('user_left', socket.userName); // Broadcast to all that the user has left
      console.log(`${socket.userName} disconnected`);
    }
  });

  // When a user explicitly leaves the chat
  socket.on('user_left', (userName) => {
    io.emit('user_left', userName); // Broadcast the user leaving
    console.log(`${userName} left the chat`);
  });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

});
