const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 5000
const socketIO = require('socket.io')
////const io = require("socket.io"), server = io.listen(8000);

const server = app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
  .get('/', (req, res) => res.sendFile('index.html',{ root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

let sequenceNumberByClient = new Map();

const io = socketIO(server)

// event fired every time a new client connects:
io.on("connection", (socket) => {

    socket.emit('connection');

    console.info(`Client connected [id=${socket.id}]`);
    // initialize this client's sequence number
    sequenceNumberByClient.set(socket, 1);

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        socket.emit('disconnecting');
        sequenceNumberByClient.delete(socket);
        console.info(`Client gone [id=${socket.id}]`);
    });

    socket.on('event', function(data){
        console.log("server got data");
        socket.emit('sent event');
        console.log(data);
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