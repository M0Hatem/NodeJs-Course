const { Server } = require('socket.io');
let io;
module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket not init!');
    }
    return io;
  },
};
