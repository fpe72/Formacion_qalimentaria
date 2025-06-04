const jwt = require('jsonwebtoken');
const onlineUsers = new Map();          // email -> socket.id

module.exports = (io) => {
  io.on('connection', (socket) => {
    // 1. autenticamos: el front envía { token } al conectar
    socket.on('auth', (token) => {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const email = payload.email.toLowerCase();
        const isAdmin = payload.role === 'admin'; 
        onlineUsers.set(email, socket.id);

        /* 👉 si ES admin se une a la sala 'admins' */
        if (isAdmin) {
          socket.join('admins');
          /* 1️⃣ Enviamos SOLO a este socket la lista actual */
          socket.emit('online-users', Array.from(onlineUsers.keys()));
        }
        io.to('admins').emit('user-online', { email });

        socket.on('disconnect', () => {
          onlineUsers.delete(email);
          io.to('admins').emit('user-offline', { email });
        });
      } catch { socket.disconnect(); }
    });
  });
};
