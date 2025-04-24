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

  socket.on('set_user_name', (name) => {
    socket.userName = name;
  });

  socket.on('send_message', (data) => {
    io.emit('receive_message', data);
  });

  socket.on('user_typing', (userName) => {
    socket.broadcast.emit('user_typing', userName);
  });

  socket.on('disconnect', () => {
    if (socket.userName) {
      io.emit('user_left', socket.userName);
      console.log(`${socket.userName} disconnected`);
    }
  });

  socket.on('user_left', (userName) => {
    io.emit('user_left', userName);
    console.log(`${userName} left the chat`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
