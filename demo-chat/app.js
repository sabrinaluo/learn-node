var express = require('express');
var http = require('http');
var socket = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socket(server);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
});

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.broadcast.emit('new connection', 'A user connected');

  socket.on('chat message', function (msg) {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function (data) {
    console.log('user disconnected');
    console.log(data)
  })


});

server.listen(3000, function () {
  console.log('demo chat app is listening on :3000');
});