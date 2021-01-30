const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  serveClient: false
});

const { debounce } = require('min-dash');

app.use(express.static('../client/dist'));

let chatMessages = [];

chatMessages = [
  { name: 'Philipp', enter: true },
  { name: 'Philipp', message: 'Hello' },
  { name: 'Nico', enter: true },
  { name: 'Nico', message: 'Hi there' }
];

const DEBOUNCE_TIMEOUT = 2000;

io.on('connection', (socket) => {
  function emitChatMessage(chatMessage) {
    chatMessages.push(chatMessage);

    io.emit('chatMessage', chatMessage);
  }

  io.to(socket.id).emit('chatMessages', chatMessages);

  socket.on('chatMessage', (chatMessage) => {
    emitChatMessage(chatMessage);
  });

  socket.on('enterChat', ({ name }) => {
    emitChatMessage({
      enter: true,
      name
    });
  });

  socket.on('leaveChat', ({ name }) => {
    emitChatMessage({
      leave: true,
      name
    });
  });

  const emitTypingStopped = debounce(name => {
    chatMessages = chatMessages.filter(chatMessage => {
      if (!chatMessage.typing) {
        return true;
      }

      return chatMessage.name !== name;
    });

    io.emit('chatMessages', chatMessages);
  }, DEBOUNCE_TIMEOUT);

  socket.on('typing', ({ name }) => {
    const hasChatMessage = chatMessages.find(chatMessage => {
      return chatMessage.name === name && chatMessage.typing;
    });

    if (!hasChatMessage) {
      const chatMessage = {
        typing: true,
        name
      };
  
      chatMessages.push(chatMessage);
  
      emitChatMessage(chatMessage);
    }

    emitTypingStopped(name);
  });

  socket.on('disconnect', ({ reason }) => {
    console.log(`disconnect`, reason);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});