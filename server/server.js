// const { createServer } = require("http");
// const { Server } = require("socket.io");

// const httpServer = createServer();

// // var express = require('express');
// // // var cors = require('cors')
// // var app = express();
// // var http = require('http').Server(app);
// const io = new Server('socket.io')(httpServer, {
//     cors: {
//         origin: true
//         // allowedHeaders: ["my-custom-header"]
//     },
// })
// // ['http://localhost:8080', 'https://admin.socket.io', 'https://fix-chat--fluffy-panda-da842f.netlify.app']
// const port = process.env.PORT || 3000;

// let users = []
// let allrooms = []

// io.on('connection', (socket) => {
//     // console.log(`User connected ${socket.id}`);

//     socket.on('chatMessage', (msg, room) => {
//         const user = users.find(user => user.id === socket.id)
//         io.to(room).emit('message', user.username, msg)
//     })
    
//     socket.on('join-room', (username, room) => {
//         const user = {
//             username,
//             room,
//             id: socket.id,
//         }
//         users.push(user)
//         if(user.room){
//             const rooms = {
//                 room,
//                 count: 0,
//             }
//             const id = allrooms.findIndex(name => name.room === room)
//             if (id == -1) {
//                 // rooms.count++
//                 console.log(rooms);
//                 allrooms.push(rooms)
//                 console.log(allrooms);
//             } else {
//                 // allrooms[id].count++
//             }
//             console.log('room: '+ room);
//             socket.join(room)
//             socket.emit('create-room', room)
//             io.to(room).emit('all-user-room', users)
//         }

//     })
//     io.emit('room-list', allrooms)

//     // console.log(io.sockets.adapter.rooms);

//     // console.log(socket.rooms);

//     // console.log(Object.keys(io.engine.clients)) //all users
    

//     // console.log(socket.rooms);

//     socket.on('disconnect', () => {
//         const index = users.findIndex(user => user.id === socket.id)
//         if (index !== -1) {
//             // for (let obj of allrooms) {
//             //     if (obj.room === users[index].room) {
//             //         obj.count--
//             //         break
//             //     }
//             // }
//             // const delRoom = allrooms.findIndex(room => room.count === 0)
//             // if (delRoom !== -1) {
//             //     allrooms.splice(index, 1);
//             // }
//             users.splice(index, 1);
//         }
//         console.log(allrooms);
//         // console.log(`Socket disconnect! ${socket.id}`);
//     });
// });

// // app.get('/products/:id', cors(corsOptions), function (req, res, next) {
// //     res.json({msg: 'This is CORS-enabled for a Single Route'})
// // })
// io.listen(port, function () {
//     console.log('CORS-enabled web server listening on port '+ port)
// })
// // http.listen(port, function() {
// //     console.log('listening on *: ' + port);
// // });

// const { createServer } = require("http");
// const { Server } = require("socket.io");

// const httpServer = createServer();

// const io = new Server(httpServer, {
//     cors: {
//       origin: ['http://localhost:8080', 'https://admin.socket.io', 'https://fluffy-panda-da842f.netlify.app']
//     }
// });

// const port = process.env.PORT || 3000;

// let users = []
// let allrooms = []

// io.on("connection", (socket) => {
//         console.log(`User connected ${socket.id}`);

//     socket.on('chatMessage', (msg, room) => {
//         const user = users.find(user => user.id === socket.id)
//         console.log(user);
//         if (user) io.to(room).emit('message', user.username, msg)
//     })
    
//     socket.on('join-room', (username, room) => {
//         const user = {
//             username,
//             room,
//             id: socket.id,
//         }
//         users.push(user)
//         if(user.room){
//             const rooms = {
//                 room,
//                 count: 0,
//             }
//             const id = allrooms.findIndex(name => name.room === room)
//             if (id == -1) {
//                 // rooms.count++
//                 console.log(rooms);
//                 allrooms.push(rooms)
//                 console.log(allrooms);
//             } else {
//                 // allrooms[id].count++
//             }
//             console.log('room: '+ room);
//             socket.join(room)
//             socket.emit('create-room', room)
//             io.to(room).emit('all-user-room', users)
//         }

//     })
//     io.emit('room-list', allrooms)

//     // console.log(io.sockets.adapter.rooms);

//     // console.log(socket.rooms);

//     // console.log(Object.keys(io.engine.clients)) //all users
    

//     // console.log(socket.rooms);

//     socket.on('disconnect', () => {
//         const index = users.findIndex(user => user.id === socket.id)
//         if (index !== -1) {
//             // for (let obj of allrooms) {
//             //     if (obj.room === users[index].room) {
//             //         obj.count--
//             //         break
//             //     }
//             // }
//             // const delRoom = allrooms.findIndex(room => room.count === 0)
//             // if (delRoom !== -1) {
//             //     allrooms.splice(index, 1);
//             // }
//             users.splice(index, 1);
//         }
//         console.log(allrooms);
//         // console.log(`Socket disconnect! ${socket.id}`);
//     });
// });


// io.listen(port, function () {
//     console.log('CORS-enabled web server listening on port '+ port)
// })

import { createServer } from "http";
import { Server } from "socket.io";
import State from './modules/State/State.js';

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:8080', 'https://admin.socket.io', 'https://fluffy-panda-da842f.netlify.app']
    }
});

const port = process.env.PORT || 3000;

// let users = []
let allrooms = []

io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`);
    
    // socket.on('join-room', (username, room) => {
    //     // const user = {
    //     //     username,
    //     //     room,
    //     //     id: socket.id,
    //     // }
    //     // users.push(user)
    //     const roomInfo = {
    //             room,
    //             users: [{
    //                 username,
    //                 color,
    //                 ready,
    //             }],
    //             HideBank,
    //             GameMode,
    //             GameMap,
    //             Dice,
    //         }
    //         // const rooms = {
    //         //     room,
    //         //     count: 0,
    //         // }
    //         // const id = allrooms.findIndex(name => name.room === room)
    //         // if (id == -1) {
    //             // rooms.count++
    //             allrooms.push(roomInfo)
    //             console.log(allrooms);
    //         // } else {
    //             // allrooms[id].count++
    //         // }
    //         console.log('room: '+ room);
    //         socket.join(room)
    //         socket.emit('create-room', room)
    //         io.to(room).emit('all-user-room', users)
    // })

    socket.on('join-room', (username, room) => {
        const index = allrooms.findIndex(findRoom => findRoom.room === room)
        if (index == -1) {
            const roomInfo = {
                room,
                users: [{
                    username,
                    id: socket.id,
                    ready: false,
                }],
                colors: ['red', 'blue', 'orange', 'green'],
                HideBank: true,
                FriendlyRobber: true,
                GameMode: 'Base',
                GameMap: 'Classic',
                Dice: 'Random',
            }
            allrooms.push(roomInfo)
            socket.join(room)
            socket.to(room).emit('all-user-room', roomInfo.users)
        } else {
            const user = {
                username,
                id: socket.id,
                ready: false,
            }
            console.log(allrooms[index])
            allrooms[index].users.push(user)
            io.to(room).emit('all-user-room', allrooms[index].users)
        }
        console.log(allrooms);
        socket.emit('create-room', room)
    })
    socket.on('create-game', room => {
        const index = allrooms.findIndex(findRoom => findRoom.room === room)
        const gameSettings = allrooms[index]
        const state = new State()
        state.playersCount = gameSettings.users.length
        state.gameMode = gameSettings.GameMode
        state.initialState()
        for (let i = 0; i < state.playersCount; i++) {
            state.playersInfo[i].color = gameSettings.colors[i]
        }
        console.log(state)
        socket.emit('Map-object', state.mapObject, state.playersInfo)
    })


    io.emit('room-list', allrooms)

    socket.on('chatMessage', (msg, room, user) => {
        io.to(room).emit('message', user, msg)
    })

    // console.log(io.sockets.adapter.rooms);

    // console.log(socket.rooms);

    // console.log(Object.keys(io.engine.clients)) //all users
    

    // console.log(socket.rooms);

    socket.on('disconnect', () => {
        // const index = users.findIndex(user => user.id === socket.id)
        // if (index !== -1) {
        //     users.splice(index, 1);
        // }
        // console.log(allrooms);
    });
});


io.listen(port, function () {
    console.log('CORS-enabled web server listening on port '+ port)
})