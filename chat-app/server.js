const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Phục vụ file tĩnh (index.html)
app.use(express.static(__dirname));

// Quản lý số người online
let onlineUsers = 0;

io.on('connection', (socket) => {
  // Tăng số người online và thông báo
  onlineUsers++;
  io.emit('userCount', onlineUsers);
  io.emit('userStatus', `Có người vừa tham gia! (Tổng: ${onlineUsers})`);

  // Xử lý tin nhắn
  socket.on('chatMessage', (data) => {
    io.emit('chatMessage', data); // Gửi tin nhắn đến tất cả client
  });

  // Xử lý khi người dùng rời
  socket.on('disconnect', () => {
    onlineUsers = Math.max(0, onlineUsers - 1); // Đảm bảo không âm
    io.emit('userCount', onlineUsers);
    io.emit('userStatus', `Có người vừa rời! (Còn: ${onlineUsers})`);
  });
});

// Khởi động server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});