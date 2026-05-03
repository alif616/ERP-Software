let io;

module.exports = {
  setupSocket: (serverIo) => {
    io = serverIo;
    io.on('connection', (socket) => {
      console.log('New client connected');
      socket.on('disconnect', () => console.log('Client disconnected'));
    });
  },
  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
  }
};