import { createServer } from "http";
import { Server } from "socket.io";
import roadCounter from "./modules/State/RoadCounter.js";
import State from './modules/State/State.js';

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:8080', 'https://admin.socket.io', 'https://fluffy-panda-da842f.netlify.app']
    }
});

const port = process.env.PORT || 3000;

const allrooms = []
const allGame = new Map()

io.on("connection", (socket) => {

    io.emit('room-list', allrooms)

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
                hideBank: true,
                friendlyRobber: true,
                gameMode: 'classic',
                gameMap: 'newbie',
                dice: 'random',
                lobbyState: 'Lobby',
            }
            allrooms.push(roomInfo)
            socket.join(room)
            io.to(room).emit('all-user-room', roomInfo.users)
        } else {
            if (allrooms[index].lobbyState == 'Lobby') {
                const user = {
                    username,
                    id: socket.id,
                    ready: false,
                }
                socket.join(room)
                allrooms[index].users.push(user)
                io.to(room).emit('all-user-room', allrooms[index].users)
            } else {
                socket.emit('create-room-late', room)
            }
        }
        socket.emit('create-room', room)
        io.emit('room-list', allrooms)
    })

    socket.on('change-settings-map', (room, settings) =>{
        const index = allrooms.findIndex(findRoom => findRoom.room === room)
        allrooms[index].gameMap = settings
        io.to(room).emit('see-map-changes', settings)
    })

    socket.on('create-game', room => {
        const index = allrooms.findIndex(findRoom => findRoom.room === room)
        if (index != -1) {
            if (!allGame.has(room)) {
                const gameSettings = allrooms[index]
                const state = new State()
                state.playersCount = gameSettings.users.length
                state.gameMap = gameSettings.gameMap
                state.initialState()
                for (let i = 0; i < state.playersCount; i++) {
                    state.playersInfo[i].name = gameSettings.users[i].username
                    state.playersInfo[i].color = gameSettings.colors[i]
                }
                allGame.set(room, state)
            }
            socket.emit('Map-object', allGame.get(room).mapObject, allGame.get(room).playersInfo)
        }
    })

    socket.on('leave-lobby', (room, name) =>{
        const index = allrooms.findIndex(findRoom => findRoom.room === room)
        if (index !== -1) {
            const indexUser = allrooms[index].users.findIndex(findUser => findUser.username === name)
            if (indexUser !== -1) {
                allrooms[index].users.splice(indexUser, 1);
                const msg = 'disconnect'
                io.to(room).emit('message', name, msg)
                io.to(room).emit('all-user-room', allrooms[index].users)

                if ( allrooms[index].users.length === 0) {
                    allrooms.splice(index, 1)
                    io.emit('room-list', allrooms)
                }
            }
        }
    })

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
        const index = allrooms.findIndex(findRoom => findRoom.room === room)
        let ready = true
        for (let i = 0; i < allrooms[index].users.length; i++) {
            if (!allrooms[index].users[i].ready) {
                ready = false
                io.to(room).emit('message', 'Bot', `${allrooms[index].users[i].username} not ready`)
            }
        }
        if(ready) io.to(room).emit('ChangeToGamePage')
    })

    // game
    socket.on('game-chatMessage', (msg, room, user) => {
        io.to(room).emit('game-message', user, msg)
    })

    socket.on('join-game-room', (room) => {
        const index = allrooms.findIndex(findRoom => findRoom.room === room)
        if (index !== -1) {
            allrooms[index].lobbyState = 'Started'
            socket.join(room)
        }
    })

    socket.on('give-room-list-players', (room) => {
        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })

    socket.on('isYouTurnPlayer', (room, name) =>{
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === name)
        const active = allGame.get(room).activePlayer === index ? true : false
        if (active) io.to(room).emit('game-message', 'Bot', `${allGame.get(room).playersInfo[index].name} turn`)
        if (allGame.get(room).turn > 0) {
            socket.emit('Turn-player', allGame.get(room).playersInfo[index], active)
        } else {
            socket.emit('firstSettlementMode', allGame.get(room).playersInfo[index], active)
        }
    })

    socket.on('setNewSettlement', (player, id, room) => {
        allGame.get(room).setNewSettlement(player, id)
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        allGame.get(room).playersInfo[index] = player
        allGame.get(room).playersInfo[index].settlementsStock--
        if (allGame.get(room).turn == 0) {
            allGame.get(room).addResoursesFirstSettlement(allGame.get(room).mapObject, allGame.get(room).playersInfo[index])
        }
        if (allGame.get(room).turn > 0) {
            allGame.get(room).playersInfo[index].hand.resources.lumber -= 1
            allGame.get(room).playersInfo[index].hand.resources.brick -= 1
            allGame.get(room).playersInfo[index].hand.resources.wool -= 1
            allGame.get(room).playersInfo[index].hand.resources.grain -= 1
        }
        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })

    socket.on('setNewRoad', (player, id, room, isFree) =>{
        allGame.get(room).setNewRoad(player, id)
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        allGame.get(room).playersInfo[index] = player
        allGame.get(room).playersInfo[index].roadsStock--
        if (allGame.get(room).turn > 0) {
            if (!isFree) {
                allGame.get(room).playersInfo[index].hand.resources.lumber -= 1
                allGame.get(room).playersInfo[index].hand.resources.brick -= 1
            }
        }
        allGame.get(room).playersInfo[index].roadChain = roadCounter(
            allGame.get(room).mapObject,
            player.color, 
            id
        );
        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })

    socket.on('setNewCity', (player, id, room) =>{
        allGame.get(room).setNewCity(player, id)
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        allGame.get(room).playersInfo[index] = player
        allGame.get(room).playersInfo[index].settlementsStock++
        allGame.get(room).playersInfo[index].citiesStock--

        allGame.get(room).playersInfo[index].hand.resources.ore -= 3
        allGame.get(room).playersInfo[index].hand.resources.grain -= 2

        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })

    socket.on('setRobber', (player, id, room, knights) =>{
        const sett = allGame.get(room).setRobber(player, id)
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        if(knights) {
            allGame.get(room).playersInfo[index].hand.development.knights -=1
            allGame.get(room).playersInfo[index].armySize +=1
            allGame.get(room).calculateMaxArmySize(allGame.get(room), allGame.get(room).playersInfo)
        }
        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
        io.to(room).emit('renderFullMapView', allGame.get(room).mapObject)
        socket.emit('take-one-res', sett)
    })
    socket.on('robberCheckCards',(room) =>{
        allGame.get(room).countCardRobber(allGame.get(room).playersInfo)
        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })
    socket.on('transfer-one-to-another', (player, room, color) =>{
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        allGame.get(room).transferOneToAnother(player, color)
        allGame.get(room).playersInfo[index] = player
        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })
    socket.on('del-card-robber', (player, room) =>{
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        allGame.get(room).playersInfo[index] = player

        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })

    socket.on('updateMap', (room) => {
        io.to(room).emit('renderFullMapView', allGame.get(room).mapObject)
    })

    socket.on('buy-develop-card', (player, room) => {
        allGame.get(room).buyDevelopmentCard(player)
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        allGame.get(room).playersInfo[index] = player

        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })

    socket.on('Next-person', (room) => {
        if (allGame.get(room).turn) {
            if (allGame.get(room).activePlayer < allGame.get(room).playersInfo.length -1) {
                allGame.get(room).activePlayer++
            } else if(allGame.get(room).activePlayer >= allGame.get(room).playersInfo.length -1){
                allGame.get(room).turn++
                if (allGame.get(room).turn){
                    allGame.get(room).activePlayer = 0
                } else {
                    allGame.get(room).activePlayer = allGame.get(room).playersInfo.length-1
                }
            }
        } else {
            if (allGame.get(room).activePlayer > 0) {
                allGame.get(room).activePlayer--
            } else if(allGame.get(room).activePlayer <= 0){
                allGame.get(room).turn++
                allGame.get(room).activePlayer = 0
            }
        }
        io.to(room).emit('Client-turn')
    })

    socket.on('weRollDice', (room, roll) => {
        allGame.get(room).diceRoll = roll;
        allGame.get(room).addResoursesThisTurn(
            (roll[0] + roll[1]),
            allGame.get(room).mapObject,
            allGame.get(room).playersInfo);
    });

    socket.on('playMonopolyCard', (room, player, resource) =>{
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        allGame.get(room).monopolyCard(allGame.get(room).playersInfo, allGame.get(room).playersInfo[index], resource)

        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })
    socket.on('playPlentyCard', (room, player, resource) =>{
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        allGame.get(room).plentyCard(allGame.get(room).playersInfo[index], resource)

        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })

    socket.on('playDevelopRoads', (room, player) =>{
        const index = allGame.get(room).playersInfo.findIndex(findUser => findUser.name === player.name)
        allGame.get(room).playersInfo[index].hand.development.road--
        io.to(room).emit('Change-playerInfo', allGame.get(room).playersInfo)
    })
    socket.on('victory', (room, player) =>{
        io.to(room).emit('victory-info', player)
    })

    socket.on('disconnect', () => {
    });
});


io.listen(port, function () {
    console.log('CORS-enabled web server listening on port '+ port)
})
