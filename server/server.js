const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});
const path = require('path');
const cors = require("cors");
const mongoose = require('mongoose');
const { User, Message, Session } = require('./database.js');
require('dotenv').config()
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  process.exit();
});
const vueHistory = require('connect-history-api-fallback');

app.use(cors());
app.use(vueHistory()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

app.post('/login', (req, res) => {
  let user = req.body;
  User.findOne({phone: user.phone, 
    password: user.password})
  .then((result) => {
    if (result) {
      res.json({user: result, old: true});
      console.log(result)
    } else {
      User.find({})
      .sort({_id:-1})
      .limit(1)
      .then(one => {
        user.account = one[0].account+1;
        user.username = Math.random().toString(36).substring(3,15);
        user.friends = [4]
        let register = new User(user);
        register.save();
      })
      .then(() => {
        User.findOne({phone: user.phone, 
          password: user.password})
        .then((result) => {
          res.json({user: result, old: false})
        })
        .catch((err) => {
          console.error(err)
        })
      })
    }
  })
  .catch((err) => {
    res.sendStatus(400);
  })
});

app.post('/change', (req, res) => {
  let user = req.body;
  User.findOne({account: user.account})
  .then((result) => {
    if (result) {
      result.username = user.username;
      result.phone = user.phone;
      result.save();
      res.json({user: result});
    }
  })
});

function chatHistory(user, friend) {
  return Message.find({$or: 
    [{from: user.account, to: friend.account},
    {from: friend.account, to: user.account}]
  }).then(dialog => {
    friend.dialog = dialog
    return friend
  })
}

io.on('connection', async (socket) => {
  console.log('user connected');

  socket.on("get friends", (user, callback) => {
    Session.findOne({account: user.account})
    .then(ses => {
      if (ses == null){
        ses = new Session({
            account: user.account,
            username: user.username,
            connected: true,
            session: socket.id
          })
      } else {
        ses.username = user.username
        ses.connected = true;
        ses.session = socket.id;
      }
      ses.save()
    });
    Session.find({account: {$in: user.friends}})
    .then(results => {
      Promise.all(results.map(
        friend => chatHistory(user, friend)))
      .then(users => {
        callback({ data: users });
        console.log("get friends done")
      })
    });
    const me = user.account;
    for (const friend in user.friends){
      let u1 = user.friends[friend];
      let room = (u1<me)?('c'+u1+'-'+me):('c'+me+'-'+u1);
      socket.join(room);
      socket.to(room).emit('user connect', user.account);
      console.log(room, 'joined');
    }
  });

  socket.on("private message", (message) => {
    let newMessage = new Message(message);
    newMessage.save();
    console.log(message)
    let u1 = message.to;
    let u2 = message.from;
    let room = (u1<u2)?('c'+u1+'-'+u2):('c'+u2+'-'+u1);
    socket.to(room).emit("private message", message);
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      console.log(room)
      socket.to(room).emit("user disconnect", room);
    });
  });

  socket.on('message', (room, message) => {
    socket.to(room).emit('message', message);
  });

  socket.on('live call', (room) => {
    console.log('Received request to start live call: ' + room);
    var clientsInRoom = io.sockets.adapter.rooms.get(room);
    if (!clientsInRoom){
      socket.join(room);
      socket.emit('created', room);
    } else if (clientsInRoom.size === 1) {
      io.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room);
      io.in(room).emit('ready');
    }
  });

  socket.on('end call', (room) => {
    socket.leave(room);
    io.in(room).emit('end call');
  })

  socket.on('disconnect', () => {
    Session.findOne({session: socket.id})
    .then((s) => {
      if (s){
        s.session = null;
        s.connected = false;
        s.save();
      }
      console.log('user disconnected');
    })
  });
});

server.listen(process.env.PORT, () => {
  console.log('Listening on port:3000');
});