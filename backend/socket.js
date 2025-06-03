const jwt = require('jsonwebtoken');
const onlineUsers = new Map();          // email -> socket.id

module.exports = (io) => {
  io.on('connection', (socket) => {
    // 1. autenticamos: el front envía { token } al conectar
    socket.on('auth', (token) => {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const email = payload.email.toLowerCase();
        onlineUsers.set(email, socket.id);

        // avisamos a los admins
        io.emit('user-online', { email });          // a todos

        socket.on('disconnect', () => {
          onlineUsers.delete(email);
          io.emit('user-offline', { email });
        });
      } catch { socket.disconnect(); }
    });
  });
};
