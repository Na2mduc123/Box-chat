const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Phục vụ file tĩnh (index.html)
app.use(express.static(__dirname));

// Quản lý số người online, danh sách username và tin nhắn
let onlineUsers = 0;
const connectedUsers = new Set();
const messages = []; // Mảng lưu tin nhắn

io.on('connection', (socket) => {
  // Gửi tin nhắn cũ khi người dùng kết nối
  socket.emit('initialMessages', messages);

  // Tăng số người online và thêm username khi kết nối
  socket.on('userConnected', (username) => {
    if (username && !connectedUsers.has(username)) {
      connectedUsers.add(username);
      onlineUsers++;
      io.emit('userCount', onlineUsers);
      io.emit('userStatus', { type: 'online', username: username });
    }
  });

  // Xử lý tin nhắn (văn bản, ảnh, video)
  socket.on('chatMessage', (data) => {
    const messageData = { username: data.username, time: data.time, content: data.content, type: data.type };
    messages.push(messageData); // Lưu tin nhắn vào mảng
    io.emit('chatMessage', messageData);
  });

  // Xử lý khi người dùng rời
  socket.on('disconnect', () => {
    const disconnectedUser = Array.from(connectedUsers).find(user => socket.user === user);
    if (disconnectedUser && connectedUsers.has(disconnectedUser)) {
      connectedUsers.delete(disconnectedUser);
      onlineUsers = Math.max(0, onlineUsers - 1);
      io.emit('userCount', onlineUsers);
      io.emit('userStatus', { type: 'offline', username: disconnectedUser });
    }
  });
});

// Khởi động server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});