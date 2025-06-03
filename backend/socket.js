const jwt = require('jsonwebtoken');
const onlineUsers = new Map();          // userId -> socket.id

module.exports = (io) => {
  io.on('connection', (socket) => {
    // 1. autenticamos: el front envía { token } al conectar
    socket.on('auth', (token) => {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId  = payload._id;
        onlineUsers.set(userId, socket.id);

        // avisamos a los admins
        io.emit('user-online', { userId, email: payload.email });

        socket.on('disconnect', () => {
          onlineUsers.delete(userId);
          io.emit('user-offline', { userId, email: payload.email });
        });
      } catch { socket.disconnect(); }
    });
  });
};
