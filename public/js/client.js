$(document).ready(function() {
  var socket = io();
  var name = null;
  var room = null;

  $("form").submit(function(event){
    event.preventDefault();
  });

  $("#loginForm").submit(function(event){
    var username = this.username.value.toUpperCase();
    var roomname = this.roomid.value.toUpperCase();

    socket.emit('login', {username: username, roomname: roomname});
  });

  socket.on('loginError', function(err){
    $('#error').text(err).show();
  });

  socket.on('loginSuccess', function(data){
    name = data.name;
    room = data.room;

    $('#loginForm').fadeOut();
    $('#error').fadeOut();
    $('#roomname').text(room).fadeIn();
    $('#room').text('Welcome!').fadeIn();
  });

  socket.on('userJoined', function(data){
    console.log(data);
    $('#room').append('<br>' + data.name + ' has joined.');
  });

  socket.on('userLeft', function(data){
    console.log(data);
    $('#room').append('<br>' + data.name + ' has left.');
  });

});
