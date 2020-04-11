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
//   .get('/', (req, res) => {

//   })
  .get('/', (req, res) => res.sendFile('index.html',{ root: __dirname }))
  .post('/', (req, res) => {
    io.emit('callbackHappened', "callbackHappened");
    console.log("callback Happened print");
	const clientSecret = getClientSecret()
	const requestBody = {
		grant_type: 'authorization_code',
		code: req.body.code,
		redirect_uri: `https://play.thewatchful.net`,
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
		// return res.json({
		// 	success: true,
		// 	data: response.data,
		// 	user: getUserId(response.data.id_token)
        // })

        var html = `<html>
            <head>
            <meta charset="utf-8" />
            <meta http-equiv="x-ua-compatible" content="ie=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>The Watchful</title>

            <link rel="stylesheet" href="styles/styles.css" />
            <link rel="icon" href="images/favicon.ico" />
            <!-- <link rel="stylesheet" href="public/styles/styles.css" />
            <link rel="icon" href="public/images/favicon.ico" /> -->


            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
                    integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">

                <script type="text/javascript"
                    src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script>
                <script type="text/javascript"
                    src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"></script>
                <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
                    integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
                    crossorigin="anonymous"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
                    integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
                    crossorigin="anonymous"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
                    integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
                    crossorigin="anonymous"></script>
            </head>

            <body>
                <div id="server-time"></div>
                <div class="dynamic active highlight highlight-javascript">
                </div>
                <div class="static highlight highlight-javascript">
                </div>
                <div id="zone_joystick">
                <div class="zone dynamic active"><h1>dynamic</h1></div>
                </div>
                <br/>
                <div>
                </div>
                <div class="login-btn" id="appleid-signin" data-color="black" data-border="true" data-type="sign in"></div>
                <div class="auth-code">Auth Code</div>
                <div class="auth-code-label" id="auth-code-value">
                ${syntaxHighlight(requestBody)}
                </div>
                    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/nipplejs/0.7.3/nipplejs.js"></script> -->
                    <!-- <script src="scripts/multikey.js"></script>
                    <script src="scripts/canvas-gamepad.js"></script> -->

                    <!-- <script src="public/scripts/controller.js"></script>
                    <script src="public/scripts/canvas.js"></script> -->
                    <!-- <script src="public/scripts/client.js"></script> -->
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/nipplejs/0.7.3/nipplejs.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>

                    <script src="scripts/canvas.js"></script>
                    <!-- <script src="scripts/controller.js"></script> -->
                    <script src="scripts/client.js"></script>
                    <script src="scripts/applesignin.js"></script>
            </body>
        </html>`

        return res.send(html)
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

const syntaxHighlight = (json) => {
   if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
   }
   json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
   return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
       var cls = 'number';
       if (/^"/.test(match)) {
           if (/:$/.test(match)) {
               cls = 'key';
           } else {
               cls = 'string';
           }
       } else if (/true|false/.test(match)) {
           cls = 'boolean';
       } else if (/null/.test(match)) {
           cls = 'null';
       }
       return '<span class="' + cls + '">' + match + '</span>';
   });
}