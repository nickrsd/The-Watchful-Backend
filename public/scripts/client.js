
document.addEventListener("DOMContentLoaded", function(event) {

    //https://mighty-everglades-83549.herokuapp.com

    var socket = io()
    //var socket = io.connect('https://www.thewatchful.net:8000');
    //const ioClient = socket.connect("http://localhost:8000")

    //ioClient.on("seq-num", (msg) => console.info(msg))

    var el = document.getElementById('server-time');

    socket.on('connect', function(){
        alert("client connected")
        console.log("client connected")
    });

    socket.on('event', function(data){
        alert("event")
        console.log("got event")
        console.log(data)
    });

    socket.on('disconnect', function(){
        alert("disconnected")
        console.log("client disconnected")
    });

    socket.on('messages', function(data) {
        alert("received message")
        console.log("received message")
        console.log(data)
    });

    socket.on('time', function(timeString) {
        el.innerHTML = 'Server time: ' + timeString;
    });



    var joystick

    var joysticks = {
        dynamic: {
            zone: document.querySelector('.zone.dynamic'),
            color: 'blue',
            multitouch: true
        },
        semi: {
            zone: document.querySelector('.zone.semi'),
            mode: 'semi',
            catchDistance: 150,
            color: 'white'
        },
        static: {
            zone: document.querySelector('.zone.static'),
            mode: 'static',
            position: {
            left: '50%',
            top: '50%'
            },
            color: 'red'
        }
    };

    function bindJoystick() {
        joystick.on('start end', function(evt, data) {
            console.log(data)
        }).on('move', function(evt, data) {
            console.log(data)
            socket.emit('movePlayer', data)
        }).on('dir:up plain:up dir:left plain:left dir:down ' +
                'plain:down dir:right plain:right',
                function(evt, data) {
            console.log(data)
        }).on('pressure', function(evt, data) {
            console.log(data)
        });
    }

    function createJoystick(evt) {
        var type = typeof evt === 'string' ?
            evt : evt.target.getAttribute('data-type');
        if (joystick) {
            joystick.destroy();
        }

        joystick = nipplejs.create(joysticks[type]);
        bindJoystick();
    }

    createJoystick('dynamic');


});