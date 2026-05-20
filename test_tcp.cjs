const net = require('net');
console.time("TCP Socket Timeout");
const socket = net.createConnection(27017, 'ac-avaui7q-shard-00-00.rpjfhdm.mongodb.net', () => {
  console.timeEnd("TCP Socket Timeout");
  console.log("Connected to TCP!");
  socket.end();
});
socket.on('error', (err) => {
  console.timeEnd("TCP Socket Timeout");
  console.error("TCP Error:", err.message);
});
