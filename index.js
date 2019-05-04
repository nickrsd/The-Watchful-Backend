const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 5000
const socketIO = require('socket.io')
const monitorio = require('monitor.io')
////const io = require("socket.io"), server = io.listen(8000);

const server = app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
  .get('/', (req, res) => res.sendFile('index.html',{ root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

let sequenceNumberByClient = new Map();

const io = socketIO(server)
io.use(monitorio({ port: 8001 }))

function logControllerState(controlData) {
    let distance = 'position x: ${controlData.position}'
}

function between(x, min, max) {
    return x >= min && x <= max;
}


let maxDistance = 50.0

// event fired every time a new client connects:
io.on("connection", (socket) => {

    io.emit('connection');

    console.info(`Client connected [id=${socket.id}]`);
    // initialize this client's sequence number
    sequenceNumberByClient.set(socket, 1);

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        io.emit('disconnecting');
        sequenceNumberByClient.delete(socket);
        console.info(`Client gone [id=${socket.id}]`);
    });

    socket.on('event', function(data){
        console.log("server got data");
        io.emit('sent event');
        console.log(data);
    });

    socket.on('movePlayer', function(data){
        console.log("server got data");
    //    let xOffset = Math.cos(data.angle.radian) * (distance / maxDistance) // get the horizontal camera offset multiplied by normalize distance 
    //    let yOffset = Math.sin(data.angle.radian) * (distance / maxDistance) // get the vertical camera offset multiplied by normalize distance 

    //     let movement = {
    //         yawOffest: data.movementMultiplier.camera * xOffset,
    //         pitchOffset: data.movementMultiplier.camera * yOffset,
    //         moveX: data.movementMultiplier.position * xOffset,
    //         moveX: data.movementMultiplier.position * yOffset 
    //     }
        let playerMove = `player${data.player}Move`
        console.log(`(p${data.player} Offsets) yaw: ${data.yawOffset} pitch: ${data.pitchOffset} x: ${data.moveX} y: ${data.moveY}`)
        io.emit(playerMove, data);
    });
});



// sends each client its current sequence number
setInterval(() => {
    for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
        client.emit("seq-num", sequenceNumber);
        sequenceNumberByClient.set(client, sequenceNumber + 1);
    }
}, 1000);

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

//server.listen(8000)