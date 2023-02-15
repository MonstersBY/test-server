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

let allrooms = []
const allGame = new Map() 

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
            io.to(room).emit('all-user-room', roomInfo.users)
        } else {
            const user = {
                username,
                id: socket.id,
                ready: false,
            }
            // console.log(allrooms[index])
            socket.join(room)
            allrooms[index].users.push(user)
            io.to(room).emit('all-user-room', allrooms[index].users)
        }
        // console.log(allrooms);
        socket.emit('create-room', room)
    })

    socket.on('create-game', room => {
        if (!allGame.has(room)) {
            const index = allrooms.findIndex(findRoom => findRoom.room === room)
            const gameSettings = allrooms[index]
            const state = new State()
            
            state.playersCount = gameSettings.users.length
            state.gameMode = gameSettings.GameMode
            state.initialState()
            for (let i = 0; i < state.playersCount; i++) {
                state.playersInfo[i].color = gameSettings.colors[i]
            }
            allGame.set(room, state)
        }
        const state = allGame.get(room)
        // console.log(allGame.get(room))
        socket.emit('Map-object', state.mapObject, state.playersInfo)
    })

    socket.on('leave-lobby', (room, name) =>{
        const index = allrooms.findIndex(findRoom => findRoom.room === room)
        const indexUser = allrooms[index].users.findIndex(findUser => findUser.username === name)
        allrooms[index].users.splice(indexUser, 1);
        const msg = 'disconnect'
        io.to(room).emit('message', name, msg)
        io.to(room).emit('all-user-room', allrooms[index].users)

        if ( allrooms[index].users.length === 0) {
            allrooms.splice(index, 1)
            io.emit('room-list', allrooms)
        }

    })

    io.emit('room-list', allrooms)

    socket.on('chatMessage', (msg, room, user) => {
        io.to(room).emit('message', user, msg)
    })

    
    socket.on('change-prepared', (room, name, status) => {
        const index = allrooms.findIndex(findRoom => findRoom.room === room)
        const indexUser = allrooms[index].users.findIndex(findUser => findUser.username === name)
        allrooms[index].users[indexUser].ready = status
        const msg = status ? 'ready' : 'not ready'
        io.to(room).emit('message', name, msg)
        io.to(room).emit('all-user-room', allrooms[index].users)
    })

    socket.on('StartGame', (room) => {
        io.to(room).emit('ChangeToGamePage')
    })

    socket.on('disconnect', () => {
        // const index = users.findIndex(user => user.id === socket.id)
        // if (index !== -1) {
        //     users.splice(index, 1);

    });
});


io.listen(port, function () {
    console.log('CORS-enabled web server listening on port '+ port)
})