//set DEBUG=socket.io* & node server
//set DEBUG=false & node server

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Store list of connected users and existing rooms
var PORT = 3000;
var users = {};
var rooms = {};

//Set static files to be served from the /public folder
app.use(express.static(__dirname + '/public'));

//Set template engine to work with .html files
app.engine('html', require('ejs').renderFile);

//Handle requests to /
app.get('/', function(req, res){
  res.render('index.html');
});

//User has connected
io.on('connection', function(socket){
  var socketID = socket.client.id;
  console.log('CHAT_STATUS: Socket ' + socketID + ' has connected');

  //User has clicked log in
  socket.on('login', function(data){
    var error = false;
    var exists = false;
    var username = data.username;
    var roomname = data.roomname;

    //Check username
    for(user in users){
      if(users[user].name == username){
          error = true;
      }
    }

    if(!error){
      users[socketID] = {name: username, room: roomname};

      for(room in rooms){
        if(rooms[room].name == roomname){
          exists = true;
        }
      }

      //If the room exists, join it, otherwise create it and join it
      if(exists){
        socket.join(roomname);
      } else {
        rooms[roomname] = {owner: socketID};
        socket.join(roomname);
      }

      //Tell Client they are sucessful
      socket.emit('loginSuccess', {name: username, room: roomname});

      //Tell everyone a user has joined
      io.to(roomname).emit('userJoined', {name: username});

      console.log('CHAT_STATUS: ' + username + ' has joined room ' + roomname);

    } else {
      //Tell Client they have failed
      socket.emit('loginError', 'Sorry, that username is already taken!');

      console.log('CHAT_STATUS: User tried to register a name already taken');
    }

  });


  //User has disconnected
  socket.on('disconnect', function(){
    if(users[socketID]){
      io.to(users[socketID].room).emit('userLeft', {name: users[socketID].name});
      delete users[socketID];
    }

    console.log('CHAT_STATUS: Socket ' + socketID + ' disconnected');
  });
});

//Starts the server on port
http.listen(PORT, function(){
  console.log('CHAT_STATUS: Server listening on port ' + PORT);
});
