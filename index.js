const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 5000
const socketIO = require('socket.io')
const monitorio = require('monitor.io')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const axios = require('axios')
const querystring = require('querystring')
////const io = require("socket.io"), server = io.listen(8000);

const server = app
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }))
  .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
  .get('/', (req, res) => res.sendFile('index.html',{ root: __dirname }))
  .post('/callback', (req, res) => {
    io.emit('callbackHappened', "callbackHappened");
    console.log("callback Happened print");
	const clientSecret = getClientSecret()
	const requestBody = {
		grant_type: 'authorization_code',
		code: req.body.code,
		redirect_uri: `https://thewatchful.herokuapp.com${PORT}/callback`,
		client_id: 'net.slickdeals.slickdeals',
		client_secret: clientSecret,
        scope: 'name email',
	}

	axios.request({
		method: "POST",
		url: "https://appleid.apple.com/auth/token",
		data: querystring.stringify(requestBody),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(response => {
        requestBody.idToken = response.data.id_token
        requestBody.authCode = requestBody.code
        io.emit("verified", querystring.stringify(requestBody))
		return res.json({
			success: true,
			data: response.data,
			user: getUserId(response.data.id_token)
		})
	}).catch(error => {
        requestBody.error = "error with verification"
        requestBody.idToken = "error with verification"
        requestBody.authCode = "error with verification"
        io.emit("verified", querystring.stringify(requestBody))
		return res.status(500).json({
			success: false,
			error: error.response.data
		})
	})
   })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

let sequenceNumberByClient = new Map();

const io = socketIO(server)
io.use(monitorio({ port: 8001 }))

var players = {
    0: {
        player: 1,
        yawOffset: 0,
        pitchOffset: 0,
        moveX: 0,
        moveY: 0
    }
}

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
        players[data.player] = data
        console.log(`(p${data.player} Offsets) yaw: ${data.yawOffset} pitch: ${data.pitchOffset} x: ${data.moveX} y: ${data.moveY}`)
    });

    socket.on('verified', function(result) {
        console.log("received verified result")
        console.log(result);
    });

    socket.on('callbackHappened', function(result) {
        console.log("received callback");
        console.log(result);
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

function updateMovement() {
    for (var key in players) {
        let playerMove = `player${key}Move`
        io.emit(playerMove, players[key])
    }
}

setInterval(updateMovement, 16)

//server.listen(8000)

const getClientSecret = () => {
    // sign with RSA SHA256
	const privateKey = fs.readFileSync(path.join(__dirname, 'DevAppleSignInKey.p8'));
	const headers = {
		kid: "8MX97CD3W4",
		typ: undefined
	}
	const claims = {
		'iss': 'X685ZATJSA',
		'aud': 'https://appleid.apple.com',
		'sub': 'net.slickdeals.slickdeals',
	}

	token = jwt.sign(claims, privateKey, {
		algorithm: 'ES256',
		header: headers,
		expiresIn: '24h'
	});

	return token
}

const getUserId = (token) => {
	const parts = token.split('.')
	try {
		return JSON.parse(new Buffer(parts[1], 'base64').toString('ascii'))
	} catch (e) {
		return null
	}
}