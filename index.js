const express = require('express');
const http = require('http');
const socketio = require('socket.io');



const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: '*'
    }
});

let users = [];

const addUser = (userId,socketId) => {
    !users.some(user => user.userId === userId) &&
        users.push({userId,socketId})
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = (userId) => {
    return users.find(user => user.userId === userId);
}

io.on("connection",(socket) => {
    console.log("a user connected");

    socket.on("addUser" , userId =>{
        addUser(userId,socket.id);
        io.emit("getUsers" , users);
    });

    socket.on("sendMessage" , ({senderId , receiverId , text}) => {
        console.log(text);
        console.log(receiverId);
        const user = getUser(receiverId);
        console.log(user);
        if(user){
            console.log(user.socketId);
            io.to(user.socketId).emit("getMessage" , {
                senderId,
                text,
            });
        }
        
    });

    socket.on("disconnect" , ()=>{
        console.log("a user disconnected");
        removeUser(socket.id);
        io.emit("getUsers" , users);
        
    });
});

server.listen(8900, () => {
    console.log(`Server started on port ${8900}`);
});