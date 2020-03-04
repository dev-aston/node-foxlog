module.exports = (io) => {
  io.on('connection', () => {
    console.log('user connected');

    io.on('disconnect', function () {
      console.log('user disconnected');
    });
  });
};